from __future__ import annotations

import re
from typing import Any

from pydantic import TypeAdapter

from langtest_gen.schemas import (
    ChooseCorrectAnswerConfig,
    FillInTheBlankConfig,
    MatchPairsConfig,
    TestComponentConfig,
    YesNoQuestionsConfig,
)

COMPONENT_ADAPTER = TypeAdapter(TestComponentConfig)


class StructuralValidationError(ValueError):
    pass


def parse_component(raw: dict[str, Any]) -> TestComponentConfig:
    return COMPONENT_ADAPTER.validate_python(raw)


def normalize_component_ids(
    component: TestComponentConfig,
    *,
    prefix: str,
) -> TestComponentConfig:
    data = component.model_dump(mode="python")
    data["id"] = f"{prefix}-{data['id']}"
    return parse_component(data)


def validate_suite(components: list[TestComponentConfig]) -> None:
    component_ids = [component.id for component in components]
    if len(component_ids) != len(set(component_ids)):
        raise StructuralValidationError("Duplicate component IDs found in suite.")
    for component in components:
        _validate_component_internal_uniqueness(component)


def _validate_component_internal_uniqueness(component: TestComponentConfig) -> None:
    if isinstance(component, ChooseCorrectAnswerConfig):
        question_ids = [question.id for question in component.questions]
        if len(question_ids) != len(set(question_ids)):
            raise StructuralValidationError(
                f"Duplicate question IDs in choose-correct-answer: {component.id}"
            )
        for question in component.questions:
            option_ids = [option.id for option in question.options]
            if len(option_ids) != len(set(option_ids)):
                raise StructuralValidationError(
                    f"Duplicate option IDs in question '{question.id}' ({component.id})"
                )
            unknown = [item for item in question.correctOptionIds if item not in set(option_ids)]
            if unknown:
                raise StructuralValidationError(
                    f"Unknown correctOptionIds in question '{question.id}' ({component.id}): {unknown}"
                )

    elif isinstance(component, FillInTheBlankConfig):
        text_ids = [item.id for item in component.texts]
        if len(text_ids) != len(set(text_ids)):
            raise StructuralValidationError(
                f"Duplicate text IDs in fill-in-the-blank: {component.id}"
            )
        for text in component.texts:
            blank_ids = [blank.id for blank in text.blanks]
            if len(blank_ids) != len(set(blank_ids)):
                raise StructuralValidationError(
                    f"Duplicate blank IDs in text '{text.id}' ({component.id})"
                )
            inline_ids = set(re.findall(r"\[\[([A-Za-z0-9_-]+)\]\]", text.content))
            if inline_ids != set(blank_ids):
                raise StructuralValidationError(
                    f"Blank ID mismatch in text '{text.id}' ({component.id}): content={sorted(inline_ids)} blanks={sorted(set(blank_ids))}"
                )

    elif isinstance(component, MatchPairsConfig):
        task_ids = [task.id for task in component.tasks]
        if len(task_ids) != len(set(task_ids)):
            raise StructuralValidationError(f"Duplicate task IDs in match-pairs: {component.id}")
        for task in component.tasks:
            row_ids = [row.id for row in task.rows]
            option_ids = [option.id for option in task.options]
            if len(row_ids) != len(set(row_ids)):
                raise StructuralValidationError(
                    f"Duplicate row IDs in task '{task.id}' ({component.id})"
                )
            if len(option_ids) != len(set(option_ids)):
                raise StructuralValidationError(
                    f"Duplicate option IDs in task '{task.id}' ({component.id})"
                )
            unknown = [row.correctOptionId for row in task.rows if row.correctOptionId not in set(option_ids)]
            if unknown:
                raise StructuralValidationError(
                    f"Unknown correctOptionId in task '{task.id}' ({component.id}): {unknown}"
                )

    elif isinstance(component, YesNoQuestionsConfig):
        task_ids = [task.id for task in component.tasks]
        if len(task_ids) != len(set(task_ids)):
            raise StructuralValidationError(
                f"Duplicate task IDs in yes-no-questions: {component.id}"
            )
        for task in component.tasks:
            question_ids = [question.id for question in task.questions]
            if len(question_ids) != len(set(question_ids)):
                raise StructuralValidationError(
                    f"Duplicate question IDs in task '{task.id}' ({component.id})"
                )
