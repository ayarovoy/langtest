from __future__ import annotations

from langtest_gen.chains.json_fallback import invoke_structured_with_fallback
from langtest_gen.config import Settings, make_llm
from langtest_gen.prompts import get_prompt_pack
from langtest_gen.schemas import TestPlan, TranscriptAnalysis


async def plan_tests(
    analysis: TranscriptAnalysis,
    *,
    language_code: str,
    settings: Settings,
) -> TestPlan:
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = make_llm(settings, temperature=0.1)
    pack = get_prompt_pack(language_code)

    messages = [
        SystemMessage(
            content=(
                "Create a section-level test plan for LangTest component types.\n"
                "Allowed component types: choose-correct-answer, fill-in-the-blank, "
                "match-pairs, yes-no-questions.\n"
                "Hard requirements:\n"
                "1) Always include at least one yes-no-questions section focused on listening/audio comprehension.\n"
                "2) If grammar_topics are present, include at least one grammar-focused section "
                "(fill-in-the-blank or choose-correct-answer).\n"
                "3) If vocabulary or key_phrases are present, include at least one vocabulary/phrases section "
                "(match-pairs or choose-correct-answer).\n"
                "Ensure a balanced plan and map topics to the most suitable component type.\n"
                f"Language hints: {pack.grammar_hints}"
            )
        ),
        HumanMessage(content=f"TranscriptAnalysis:\n{analysis.model_dump()}"),
    ]
    return await invoke_structured_with_fallback(
        llm=llm,
        messages=messages,
        model_cls=TestPlan,
    )
