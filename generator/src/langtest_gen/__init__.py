from __future__ import annotations

import json
from pathlib import Path

from langtest_gen.config import Settings
from langtest_gen.schemas import GeneratedSuiteResult


def save_suite(result: GeneratedSuiteResult, output_path: str | Path) -> None:
    path = Path(output_path)
    payload = [item.model_dump(mode="json") for item in result.config]
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


async def generate_test_suite(transcript: str, *, settings: Settings | None = None) -> GeneratedSuiteResult:
    from langtest_gen.pipeline import generate_test_suite as _generate_test_suite

    return await _generate_test_suite(transcript, settings=settings)


__all__ = ["Settings", "GeneratedSuiteResult", "generate_test_suite", "save_suite"]
