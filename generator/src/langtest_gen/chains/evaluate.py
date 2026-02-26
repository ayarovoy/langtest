from __future__ import annotations

from langtest_gen.chains.json_fallback import invoke_structured_with_fallback
from langtest_gen.config import Settings, make_llm
from langtest_gen.prompts import get_prompt_pack
from langtest_gen.schemas import EvaluationResult, TranscriptAnalysis


async def evaluate_suite(
    suite: list[dict],
    analysis: TranscriptAnalysis,
    *,
    language_code: str,
    settings: Settings,
) -> EvaluationResult:
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = make_llm(settings, temperature=0.0)
    pack = get_prompt_pack(language_code)
    target_language = language_code.lower()

    messages = [
        SystemMessage(
            content=(
                "You are an evaluator for language learning test quality.\n"
                "Return structured issues for: correctness, ambiguity, missing alternatives, pedagogy.\n"
                "Treat ambiguity as error when a highly proficient learner cannot infer one answer set.\n"
                "Be strict for fill-in-the-blank person/tense ambiguity.\n"
                f"Language consistency rule: all learner-facing strings must be in language code '{target_language}'. "
                "If mixed languages are detected, emit a severity='error' issue with issue_type='pedagogical'.\n"
                f"Language-specific ambiguity checklist: {pack.ambiguity_checklist}"
            )
        ),
        HumanMessage(
            content=(
                f"Transcript analysis:\n{analysis.model_dump()}\n\n"
                f"Generated suite JSON:\n{suite}"
            )
        ),
    ]
    return await invoke_structured_with_fallback(
        llm=llm,
        messages=messages,
        model_cls=EvaluationResult,
    )
