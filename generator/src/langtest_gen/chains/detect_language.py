from __future__ import annotations

from langtest_gen.config import Settings, make_llm
from langtest_gen.chains.json_fallback import invoke_structured_with_fallback
from langtest_gen.schemas import LanguageDetection


async def detect_language(transcript: str, settings: Settings) -> LanguageDetection:
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = make_llm(settings, temperature=0.0)
    sample = transcript[:1500]

    messages = [
        SystemMessage(
            content=(
                "Detect the primary language of the transcript. "
                "Return ISO-like short code (es/en/de/fr when applicable), language name, and confidence 0..1."
            )
        ),
        HumanMessage(content=f"Transcript sample:\n{sample}"),
    ]
    response = await invoke_structured_with_fallback(
        llm=llm,
        messages=messages,
        model_cls=LanguageDetection,
    )
    return response
