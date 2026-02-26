from __future__ import annotations

from langtest_gen.chains.json_fallback import invoke_structured_with_fallback
from langtest_gen.config import Settings, make_llm
from langtest_gen.prompts import get_prompt_pack
from langtest_gen.schemas import TranscriptAnalysis


def _chunk_text(text: str, approx_limit: int) -> list[str]:
    if len(text) <= approx_limit:
        return [text]
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0
    for paragraph in text.split("\n"):
        piece = paragraph + "\n"
        if current_len + len(piece) > approx_limit and current:
            chunks.append("".join(current))
            current = [piece]
            current_len = len(piece)
        else:
            current.append(piece)
            current_len += len(piece)
    if current:
        chunks.append("".join(current))
    return chunks


async def analyze_transcript(
    transcript: str,
    *,
    language_code: str,
    settings: Settings,
) -> TranscriptAnalysis:
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = make_llm(settings, temperature=0.2)
    pack = get_prompt_pack(language_code)
    chunks = _chunk_text(transcript, settings.chunk_token_limit)
    chunk_analyses: list[TranscriptAnalysis] = []

    for idx, chunk in enumerate(chunks, start=1):
        messages = [
            SystemMessage(
                content=(
                    "Analyze transcript chunk and extract pedagogical material for language tests.\n"
                    f"Language-specific focus: {pack.analysis_instructions}\n"
                    f"Grammar hints: {pack.grammar_hints}"
                )
            ),
            HumanMessage(
                content=(
                    f"Language code: {language_code}\n"
                    f"Chunk {idx}/{len(chunks)}:\n{chunk}"
                )
            ),
        ]
        analysis = await invoke_structured_with_fallback(
            llm=llm,
            messages=messages,
            model_cls=TranscriptAnalysis,
        )
        chunk_analyses.append(analysis)

    if len(chunk_analyses) == 1:
        return chunk_analyses[0]

    analyses_dump = [item.model_dump() for item in chunk_analyses]
    merge_messages = [
        SystemMessage(
            content=(
                "Merge partial transcript analyses into one concise analysis. "
                "Deduplicate lists, keep strongest topics and facts."
            )
        ),
        HumanMessage(content=f"Partial analyses:\n{analyses_dump}"),
    ]
    return await invoke_structured_with_fallback(
        llm=llm,
        messages=merge_messages,
        model_cls=TranscriptAnalysis,
    )
