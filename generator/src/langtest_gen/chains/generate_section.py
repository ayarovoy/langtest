from __future__ import annotations

from pathlib import Path
from typing import Any

from langtest_gen.chains.json_fallback import invoke_structured_with_fallback
from langtest_gen.config import Settings, make_llm
from langtest_gen.prompts import get_prompt_pack
from langtest_gen.schemas import (
    ChooseCorrectAnswerConfig,
    FillInTheBlankConfig,
    MatchPairsConfig,
    SectionPlan,
    TranscriptAnalysis,
    YesNoQuestionsConfig,
)


MODEL_BY_COMPONENT: dict[str, Any] = {
    "choose-correct-answer": ChooseCorrectAnswerConfig,
    "fill-in-the-blank": FillInTheBlankConfig,
    "match-pairs": MatchPairsConfig,
    "yes-no-questions": YesNoQuestionsConfig,
}


def _language_label(language_code: str) -> str:
    labels = {
        "es": "Spanish",
        "en": "English",
        "de": "German",
        "fr": "French",
    }
    return labels.get(language_code.lower(), language_code)


def _read_guide_excerpt() -> str:
    guide_path = Path(__file__).resolve().parents[4] / "GUIDE.md"
    if not guide_path.exists():
        return ""
    text = guide_path.read_text(encoding="utf-8")
    return text[:4000]


async def generate_section(
    section: SectionPlan,
    analysis: TranscriptAnalysis,
    *,
    language_code: str,
    settings: Settings,
    feedback: str | None = None,
) -> (
    ChooseCorrectAnswerConfig
    | FillInTheBlankConfig
    | MatchPairsConfig
    | YesNoQuestionsConfig
):
    from langchain_core.messages import HumanMessage, SystemMessage

    model_cls = MODEL_BY_COMPONENT[section.component_type]
    llm = make_llm(settings, temperature=0.6)
    pack = get_prompt_pack(language_code)
    output_language_label = _language_label(language_code)
    guide_excerpt = _read_guide_excerpt()
    feedback_block = feedback or "No previous feedback."

    filtered_material = {
        "focus_topic": section.focus_topic,
        "item_count": section.item_count,
        "source_material": section.source_material,
        "grammar_topics": analysis.grammar_topics,
        "vocabulary": [item.model_dump() for item in analysis.vocabulary],
        "factual_statements": analysis.factual_statements,
        "example_sentences": analysis.example_sentences,
    }

    messages = [
        SystemMessage(
            content=(
                "Generate one LangTest component JSON object only.\n"
                f"Target componentType: {section.component_type}\n"
                "Respect schema exactly. Ensure pedagogical correctness and unambiguous answers.\n"
                f"STRICT LANGUAGE RULE: all learner-facing strings must be in {output_language_label} "
                f"(language code: {language_code}).\n"
                "This includes title, descriptionMarkdown, question text, option text, prompts, "
                "reading text (textMarkdown for yes-no-questions), and commentMarkdown.\n"
                "Do not mix in other languages unless they are explicitly the lesson target tokens.\n"
                f"Language-specific rules: {pack.fill_blank_rules}\n"
                f"Ambiguity checklist: {pack.ambiguity_checklist}\n"
                f"Comment language preference: {pack.comment_language} (must follow transcript language).\n"
                "Include helpful commentMarkdown only when useful."
            )
        ),
        HumanMessage(
            content=(
                f"Section plan:\n{section.model_dump()}\n\n"
                f"Relevant analysis:\n{filtered_material}\n\n"
                f"Retry feedback:\n{feedback_block}\n\n"
                f"Reference guide excerpt:\n{guide_excerpt}"
            )
        ),
    ]
    return await invoke_structured_with_fallback(
        llm=llm,
        messages=messages,
        model_cls=model_cls,
    )
