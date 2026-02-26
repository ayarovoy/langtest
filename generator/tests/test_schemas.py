import pytest
from pydantic import ValidationError

from langtest_gen.schemas import FillTextTask, TestQuestion as QuestionSchema


def test_test_question_requires_existing_correct_option() -> None:
    with pytest.raises(ValidationError):
        QuestionSchema(
            id="q1",
            text="Pick one",
            multiple=False,
            options=[{"id": "o1", "text": "A"}, {"id": "o2", "text": "B"}],
            correctOptionIds=["o3"],
        )


def test_fill_text_task_requires_matching_blank_ids() -> None:
    with pytest.raises(ValidationError):
        FillTextTask(
            id="t1",
            content="Yo [[b1]] al cine.",
            blanks=[{"id": "b2", "correctAnswers": ["voy"]}],
        )
