import pytest

from langtest_gen.schemas import (
    ChooseCorrectAnswerConfig,
    MatchPairsConfig,
)
from langtest_gen.validators import StructuralValidationError, validate_suite


def test_validate_suite_rejects_duplicate_component_ids() -> None:
    base = {
        "id": "same-id",
        "componentType": "choose-correct-answer",
        "questions": [
            {
                "id": "q1",
                "text": "Choose",
                "multiple": False,
                "options": [{"id": "o1", "text": "A"}, {"id": "o2", "text": "B"}],
                "correctOptionIds": ["o1"],
            }
        ],
    }
    c1 = ChooseCorrectAnswerConfig(**base)
    c2 = ChooseCorrectAnswerConfig(**base)
    with pytest.raises(StructuralValidationError):
        validate_suite([c1, c2])


def test_validate_suite_rejects_duplicate_match_option_ids() -> None:
    bad = MatchPairsConfig(
        id="m1",
        componentType="match-pairs",
        tasks=[
            {
                "id": "t1",
                "rows": [
                    {"id": "r1", "prompt": "A", "correctOptionId": "o1"},
                    {"id": "r2", "prompt": "B", "correctOptionId": "o1"},
                ],
                "options": [{"id": "o1", "text": "1"}, {"id": "o1", "text": "2"}],
            }
        ],
    )
    with pytest.raises(StructuralValidationError):
        validate_suite([bad])
