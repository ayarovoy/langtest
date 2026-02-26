import asyncio

from langtest_gen.config import Settings
from langtest_gen.pipeline import generate_test_suite
from langtest_gen.schemas import (
    EvaluationResult,
    Issue,
    LanguageDetection,
    TestPlan as PlanSchema,
    TranscriptAnalysis,
    VocabItem,
)


def test_pipeline_happy_path(monkeypatch) -> None:
    async def fake_detect_language(transcript, settings):
        return LanguageDetection(code="es", name="Spanish", confidence=0.99)

    async def fake_analyze_transcript(transcript, language_code, settings):
        return TranscriptAnalysis(
            level="A1",
            grammar_topics=["pretérito indefinido"],
            vocabulary=[VocabItem(term="ayer", context="time marker", translation="вчера")],
            key_phrases=["el año pasado"],
            factual_statements=["Maria visited Madrid last year."],
            example_sentences=["Ayer fui al cine."],
        )

    async def fake_plan_tests(analysis, language_code, settings):
        return PlanSchema(
            sections=[
                {
                    "component_type": "choose-correct-answer",
                    "focus_topic": "pretérito indefinido",
                    "item_count": 1,
                    "source_material": ["Ayer fui al cine."],
                }
            ]
        )

    async def fake_generate_section(section, analysis, language_code, settings, feedback=None):
        return {
            "id": "local-1",
            "componentType": "choose-correct-answer",
            "questions": [
                {
                    "id": "q1",
                    "text": "Ayer ____ al cine.",
                    "multiple": False,
                    "options": [
                        {"id": "o1", "text": "fui"},
                        {"id": "o2", "text": "he ido"},
                    ],
                    "correctOptionIds": ["o1"],
                }
            ],
        }

    async def fake_evaluate_suite(suite, analysis, language_code, settings):
        return EvaluationResult(passed=True, issues=[])

    monkeypatch.setattr("langtest_gen.pipeline.detect_language", fake_detect_language)
    monkeypatch.setattr("langtest_gen.pipeline.analyze_transcript", fake_analyze_transcript)
    monkeypatch.setattr("langtest_gen.pipeline.plan_tests", fake_plan_tests)
    monkeypatch.setattr("langtest_gen.pipeline.generate_section", fake_generate_section)
    monkeypatch.setattr("langtest_gen.pipeline.evaluate_suite", fake_evaluate_suite)

    result = asyncio.run(generate_test_suite("test transcript", settings=Settings(api_key="test")))
    assert result.language.code == "es"
    assert len(result.config) >= 2
    assert any(section.component_type == "yes-no-questions" for section in result.plan.sections)
    assert result.evaluation.passed is True


def test_pipeline_retries_on_evaluator_error(monkeypatch) -> None:
    calls = {"generate": 0, "evaluate": 0}

    async def fake_detect_language(transcript, settings):
        return LanguageDetection(code="en", name="English", confidence=0.99)

    async def fake_analyze_transcript(transcript, language_code, settings):
        return TranscriptAnalysis(
            level="A2",
            grammar_topics=["present simple"],
            vocabulary=[],
            key_phrases=[],
            factual_statements=[],
            example_sentences=["He goes to school."],
        )

    async def fake_plan_tests(analysis, language_code, settings):
        return PlanSchema(
            sections=[
                {
                    "component_type": "fill-in-the-blank",
                    "focus_topic": "present simple",
                    "item_count": 1,
                    "source_material": ["He goes to school."],
                }
            ]
        )

    async def fake_generate_section(section, analysis, language_code, settings, feedback=None):
        calls["generate"] += 1
        if feedback:
            content = "He [[b1]] to school every day."
            answers = ["goes"]
        else:
            content = "[[b1]] to school every day."
            answers = ["goes"]
        return {
            "id": "fill-1",
            "componentType": "fill-in-the-blank",
            "texts": [{"id": "t1", "content": content, "blanks": [{"id": "b1", "correctAnswers": answers}]}],
        }

    async def fake_evaluate_suite(suite, analysis, language_code, settings):
        calls["evaluate"] += 1
        if calls["evaluate"] == 1:
            return EvaluationResult(
                passed=False,
                issues=[
                    Issue(
                        severity="error",
                        section_id="section-1-fill-in-the-blank",
                        item_id="t1",
                        issue_type="ambiguous_context",
                        description="No subject in sentence.",
                        suggestion="Add explicit subject.",
                    )
                ],
            )
        return EvaluationResult(passed=True, issues=[])

    monkeypatch.setattr("langtest_gen.pipeline.detect_language", fake_detect_language)
    monkeypatch.setattr("langtest_gen.pipeline.analyze_transcript", fake_analyze_transcript)
    monkeypatch.setattr("langtest_gen.pipeline.plan_tests", fake_plan_tests)
    monkeypatch.setattr("langtest_gen.pipeline.generate_section", fake_generate_section)
    monkeypatch.setattr("langtest_gen.pipeline.evaluate_suite", fake_evaluate_suite)

    result = asyncio.run(
        generate_test_suite(
            "some transcript",
            settings=Settings(api_key="x", max_retries=2),
        )
    )

    assert result.evaluation.passed is True
    assert calls["generate"] >= 2
