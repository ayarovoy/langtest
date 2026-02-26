from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Any

from langtest_gen.chains import (
    analyze_transcript,
    detect_language,
    evaluate_suite,
    generate_section,
    plan_tests,
)
from langtest_gen.config import Settings
from langtest_gen.schemas import (
    EvaluationResult,
    GeneratedSuiteResult,
    SectionPlan,
    TestPlan,
    TestComponentConfig,
    TranscriptAnalysis,
)
from langtest_gen.validators import StructuralValidationError, parse_component, validate_suite

logger = logging.getLogger("langtest_gen.pipeline")


@dataclass
class SectionRuntimeState:
    plan: SectionPlan
    index: int
    feedback: str | None = None
    component: TestComponentConfig | None = None

    @property
    def stable_component_id(self) -> str:
        return f"section-{self.index + 1}-{self.plan.component_type}"


def _force_component_id(component: TestComponentConfig, forced_id: str) -> TestComponentConfig:
    if hasattr(component, "model_dump"):
        data = component.model_dump(mode="python")
    else:
        data = dict(component)
    data["id"] = forced_id
    return parse_component(data)


async def _generate_single_with_validation(
    state: SectionRuntimeState,
    analysis,
    language_code: str,
    settings: Settings,
) -> TestComponentConfig:
    attempts = settings.max_retries + 1
    last_error: Exception | None = None
    for attempt in range(1, attempts + 1):
        logger.info(
            "Generating section %s (type=%s), attempt %s/%s",
            state.stable_component_id,
            state.plan.component_type,
            attempt,
            attempts,
        )
        try:
            generated = await generate_section(
                state.plan,
                analysis,
                language_code=language_code,
                settings=settings,
                feedback=state.feedback,
            )
            generated = _force_component_id(generated, state.stable_component_id)
            validate_suite([generated])
            state.component = generated
            logger.info("Section %s generated successfully.", state.stable_component_id)
            return generated
        except Exception as exc:  # noqa: BLE001 - keep retry logic broad for LLM output.
            last_error = exc
            state.feedback = f"Previous generation failed validation: {exc}"
            logger.warning("Section %s failed: %s", state.stable_component_id, exc)
    raise RuntimeError(
        f"Failed to generate section after retries: {state.plan.component_type}"
    ) from last_error


def _issues_by_section(evaluation: EvaluationResult) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for issue in evaluation.issues:
        grouped.setdefault(issue.section_id, []).append(issue.model_dump())
    return grouped


def _has_component_type(plan: TestPlan, component_type: str) -> bool:
    return any(section.component_type == component_type for section in plan.sections)


def _enforce_required_sections(plan: TestPlan, analysis: TranscriptAnalysis) -> TestPlan:
    sections = list(plan.sections)

    # Mandatory listening/audio comprehension section.
    if not _has_component_type(plan, "yes-no-questions"):
        source = analysis.factual_statements or analysis.example_sentences
        sections.append(
            SectionPlan(
                component_type="yes-no-questions",
                focus_topic="listening comprehension of the lesson audio",
                item_count=6,
                source_material=source[:12],
            )
        )

    # If grammar was explicitly covered, ensure grammar exercise section exists.
    has_grammar_signal = len(analysis.grammar_topics) > 0
    has_grammar_section = any(
        section.component_type in {"fill-in-the-blank", "choose-correct-answer"} for section in sections
    )
    if has_grammar_signal and not has_grammar_section:
        source = analysis.grammar_topics + analysis.example_sentences
        sections.append(
            SectionPlan(
                component_type="fill-in-the-blank",
                focus_topic=f"grammar focus: {analysis.grammar_topics[0]}",
                item_count=8,
                source_material=source[:16],
            )
        )

    # If new vocabulary/phrases were introduced, ensure lexical section exists.
    has_lexical_signal = len(analysis.vocabulary) > 0 or len(analysis.key_phrases) > 0
    has_lexical_section = any(
        section.component_type in {"match-pairs", "choose-correct-answer"} for section in sections
    )
    if has_lexical_signal and not has_lexical_section:
        vocab_terms = [item.term for item in analysis.vocabulary]
        source = vocab_terms + analysis.key_phrases
        sections.append(
            SectionPlan(
                component_type="match-pairs",
                focus_topic="new vocabulary and expressions from the lesson",
                item_count=8,
                source_material=source[:20],
            )
        )

    return TestPlan(sections=sections)


async def generate_test_suite(
    transcript: str,
    *,
    settings: Settings | None = None,
) -> GeneratedSuiteResult:
    active_settings = settings or Settings()
    logger.info("Generation started.")

    logger.info("Step 1/6: Detecting transcript language.")
    language = await detect_language(transcript, active_settings)
    logger.info(
        "Detected language: %s (%s), confidence=%.2f",
        language.code,
        language.name,
        language.confidence,
    )
    logger.info("Step 2/6: Analyzing transcript.")
    analysis = await analyze_transcript(
        transcript,
        language_code=language.code,
        settings=active_settings,
    )
    logger.info(
        "Analysis complete: grammar_topics=%s, vocabulary=%s, factual_statements=%s",
        len(analysis.grammar_topics),
        len(analysis.vocabulary),
        len(analysis.factual_statements),
    )
    logger.info("Step 3/6: Planning test sections.")
    plan = await plan_tests(
        analysis,
        language_code=language.code,
        settings=active_settings,
    )
    plan = _enforce_required_sections(plan, analysis)
    logger.info("Plan ready: %s section(s).", len(plan.sections))

    logger.info("Step 4/6: Generating planned sections.")
    states = [SectionRuntimeState(plan=section, index=idx) for idx, section in enumerate(plan.sections)]
    components = await asyncio.gather(
        *[
            _generate_single_with_validation(state, analysis, language.code, active_settings)
            for state in states
        ]
    )
    validate_suite(components)
    logger.info("Section generation complete: %s section(s) validated structurally.", len(components))

    logger.info("Step 5/6: Evaluating generated suite.")
    evaluation = await evaluate_suite(
        [component.model_dump(mode="python") for component in components],
        analysis,
        language_code=language.code,
        settings=active_settings,
    )
    logger.info("Evaluator returned %s issue(s).", len(evaluation.issues))

    logger.info("Step 6/6: Applying retry policy for blocking issues.")
    for retry_round in range(1, active_settings.max_retries + 1):
        blocking = [
            issue
            for issue in evaluation.issues
            if issue.severity == "error"
            and issue.issue_type in {"incorrect_answer", "ambiguous_context", "pedagogical"}
        ]
        if not blocking:
            logger.info("No blocking issues remaining.")
            break
        logger.warning("Retry round %s: %s blocking issue(s) detected.", retry_round, len(blocking))

        grouped = _issues_by_section(evaluation)
        regen_tasks = []
        for state in states:
            section_issues = grouped.get(state.stable_component_id)
            if not section_issues:
                continue
            state.feedback = f"Evaluator issues: {section_issues}"
            regen_tasks.append(
                _generate_single_with_validation(state, analysis, language.code, active_settings)
            )
        if not regen_tasks:
            logger.warning("No sections mapped for retry, stopping retries.")
            break
        await asyncio.gather(*regen_tasks)
        components = [state.component for state in states if state.component is not None]
        if len(components) != len(states):
            raise StructuralValidationError("Regeneration produced incomplete section set.")
        validate_suite(components)
        evaluation = await evaluate_suite(
            [component.model_dump(mode="python") for component in components],
            analysis,
            language_code=language.code,
            settings=active_settings,
        )
        logger.info(
            "Post-retry round %s evaluation: %s issue(s).",
            retry_round,
            len(evaluation.issues),
        )

    logger.info("Generation finished.")
    return GeneratedSuiteResult(
        language=language,
        analysis=analysis,
        plan=plan,
        config=components,
        evaluation=evaluation,
    )
