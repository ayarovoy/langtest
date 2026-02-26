from __future__ import annotations

import json
import logging
import re
from typing import Any, TypeVar

from pydantic import BaseModel

ModelT = TypeVar("ModelT", bound=BaseModel)
logger = logging.getLogger("langtest_gen.fallback")


def _is_response_format_error(exc: Exception) -> bool:
    text = str(exc).lower()
    return "response_format" in text and "unavailable" in text


def _coerce_content_to_text(content: object) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                value = item.get("text")
                if isinstance(value, str):
                    parts.append(value)
        return "\n".join(parts).strip()
    return str(content)


def _extract_json_string(text: str) -> str:
    stripped = text.strip()
    if not stripped:
        raise ValueError("LLM fallback returned empty response.")

    # First try direct JSON parse.
    try:
        json.loads(stripped)
        return stripped
    except Exception:
        pass

    # Try fenced ```json blocks.
    fence_matches = re.findall(r"```(?:json)?\s*(.*?)```", stripped, flags=re.IGNORECASE | re.DOTALL)
    for candidate in fence_matches:
        candidate = candidate.strip()
        try:
            json.loads(candidate)
            return candidate
        except Exception:
            continue

    # Scan for first parsable object/array.
    decoder = json.JSONDecoder()
    for i, ch in enumerate(stripped):
        if ch not in "{[":
            continue
        try:
            _, end = decoder.raw_decode(stripped[i:])
            return stripped[i : i + end]
        except Exception:
            continue
    raise ValueError("Could not locate valid JSON in LLM fallback response.")


async def invoke_structured_with_fallback(
    llm: object,
    messages: list[object],
    model_cls: type[ModelT],
) -> ModelT:
    from langchain_core.messages import HumanMessage

    try:
        chain = llm.with_structured_output(model_cls)
        return await chain.ainvoke(messages)
    except Exception as exc:
        if not _is_response_format_error(exc):
            raise
        logger.warning("Structured output unavailable, switching to JSON-text fallback.")

    schema = json.dumps(model_cls.model_json_schema(), ensure_ascii=False)
    fallback_messages = list(messages)
    fallback_messages.append(
        HumanMessage(
            content=(
                "Fallback mode: the provider does not support response_format.\n"
                "Your previous output was invalid for structured parsing.\n"
                "Return ONLY valid JSON matching this schema exactly, no markdown, no explanations, no extra text.\n"
                "Do not wrap in code fences.\n"
                f"JSON Schema:\n{schema}"
            )
        )
    )
    response = await llm.ainvoke(fallback_messages)
    text = _coerce_content_to_text(getattr(response, "content", response))
    payload = json.loads(_extract_json_string(text))
    payload = _normalize_payload_for_known_shapes(payload, model_cls)
    return model_cls.model_validate(payload)


def _normalize_payload_for_known_shapes(payload: Any, model_cls: type[BaseModel]) -> Any:
    # Evaluator fallback sometimes returns a single issue object or an array of issues
    # instead of the full EvaluationResult object.
    if model_cls.__name__ == "EvaluationResult":
        if isinstance(payload, list):
            return {"passed": len(payload) == 0, "issues": payload}
        if isinstance(payload, dict) and "issues" not in payload and "passed" not in payload:
            if {"severity", "section_id", "item_id", "issue_type"}.issubset(set(payload.keys())):
                return {"passed": False, "issues": [payload]}
    return payload
