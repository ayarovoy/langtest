from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, Field, model_validator


class StrictModel(BaseModel):
    model_config = {
        "extra": "forbid",
        "populate_by_name": True,
    }


class TestOption(StrictModel):
    id: str
    text: str
    commentMarkdown: str | None = None


class TestQuestion(StrictModel):
    id: str
    text: str
    multiple: bool
    options: list[TestOption]
    correctOptionIds: list[str]

    @model_validator(mode="after")
    def validate_links(self) -> "TestQuestion":
        option_ids = {option.id for option in self.options}
        if len(self.options) < 2:
            raise ValueError("Each question must have at least 2 options.")
        if not self.correctOptionIds:
            raise ValueError("correctOptionIds must not be empty.")
        unknown = [item for item in self.correctOptionIds if item not in option_ids]
        if unknown:
            raise ValueError(f"Unknown correctOptionIds: {unknown}")
        if not self.multiple and len(self.correctOptionIds) != 1:
            raise ValueError("Single-choice question must have exactly one correctOptionId.")
        return self


class FillBlankConfig(StrictModel):
    id: str
    correctAnswers: list[str]
    commentMarkdown: str | None = None

    @model_validator(mode="after")
    def validate_answers(self) -> "FillBlankConfig":
        clean_answers = [answer.strip() for answer in self.correctAnswers if answer.strip()]
        if not clean_answers:
            raise ValueError("correctAnswers must contain at least one non-empty string.")
        if len(set(clean_answers)) != len(clean_answers):
            raise ValueError("correctAnswers must not contain duplicates.")
        return self


class FillTextTask(StrictModel):
    id: str
    title: str | None = None
    content: str
    blanks: list[FillBlankConfig]

    @model_validator(mode="after")
    def validate_blank_ids(self) -> "FillTextTask":
        import re

        inline_ids = re.findall(r"\[\[([A-Za-z0-9_-]+)\]\]", self.content)
        inline_set = set(inline_ids)
        blank_set = {blank.id for blank in self.blanks}
        if not inline_set:
            raise ValueError("content must include at least one [[blankId]] marker.")
        if not self.blanks:
            raise ValueError("blanks must not be empty.")
        if inline_set != blank_set:
            raise ValueError(
                f"blank ids mismatch: content={sorted(inline_set)} blanks={sorted(blank_set)}"
            )
        return self


class MatchOption(StrictModel):
    id: str
    text: str


class MatchRow(StrictModel):
    id: str
    prompt: str
    correctOptionId: str
    commentMarkdown: str | None = None


class MatchTask(StrictModel):
    id: str
    title: str | None = None
    leftColumnTitle: str | None = None
    rightColumnTitle: str | None = None
    rows: list[MatchRow]
    options: list[MatchOption]

    @model_validator(mode="after")
    def validate_links(self) -> "MatchTask":
        if len(self.rows) < 2 or len(self.options) < 2:
            raise ValueError("Match task must have at least 2 rows and 2 options.")
        option_ids = {option.id for option in self.options}
        unknown = [row.correctOptionId for row in self.rows if row.correctOptionId not in option_ids]
        if unknown:
            raise ValueError(f"Unknown row.correctOptionId values: {unknown}")
        return self


class YesNoQuestion(StrictModel):
    id: str
    text: str
    correctAnswer: bool


class YesNoTask(StrictModel):
    id: str
    title: str | None = None
    texts: list[str]
    questions: list[YesNoQuestion]

    @model_validator(mode="after")
    def validate_non_empty(self) -> "YesNoTask":
        if not self.texts:
            raise ValueError("YesNo task must include at least one text block.")
        if not self.questions:
            raise ValueError("YesNo task must include at least one question.")
        return self


class BaseTestConfig(StrictModel):
    id: str
    componentType: str
    title: str | None = None
    descriptionMarkdown: str | None = None


class ChooseCorrectAnswerConfig(BaseTestConfig):
    componentType: Literal["choose-correct-answer"]
    answerLayout: Literal["vertical", "horizontal", "auto"] | None = None
    answerLayoutHeuristics: dict[str, int | float] | None = None
    questions: list[TestQuestion]

    @model_validator(mode="after")
    def validate_non_empty(self) -> "ChooseCorrectAnswerConfig":
        if not self.questions:
            raise ValueError("questions must not be empty.")
        return self


class FillInTheBlankConfig(BaseTestConfig):
    componentType: Literal["fill-in-the-blank"]
    texts: list[FillTextTask]

    @model_validator(mode="after")
    def validate_non_empty(self) -> "FillInTheBlankConfig":
        if not self.texts:
            raise ValueError("texts must not be empty.")
        return self


class MatchPairsConfig(BaseTestConfig):
    componentType: Literal["match-pairs"]
    tasks: list[MatchTask]

    @model_validator(mode="after")
    def validate_non_empty(self) -> "MatchPairsConfig":
        if not self.tasks:
            raise ValueError("tasks must not be empty.")
        return self


class YesNoQuestionsConfig(BaseTestConfig):
    componentType: Literal["yes-no-questions"]
    tasks: list[YesNoTask]

    @model_validator(mode="after")
    def validate_non_empty(self) -> "YesNoQuestionsConfig":
        if not self.tasks:
            raise ValueError("tasks must not be empty.")
        return self


TestComponentConfig = Annotated[
    ChooseCorrectAnswerConfig | FillInTheBlankConfig | MatchPairsConfig | YesNoQuestionsConfig,
    Field(discriminator="componentType"),
]


class TestSuiteConfig(StrictModel):
    items: list[TestComponentConfig]

    @model_validator(mode="after")
    def validate_unique_ids(self) -> "TestSuiteConfig":
        ids = [item.id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("Component IDs must be unique in suite.")
        return self


class LanguageDetection(StrictModel):
    code: str
    name: str
    confidence: float = Field(ge=0.0, le=1.0)


class VocabItem(StrictModel):
    term: str
    context: str | None = None
    translation: str | None = None


class TranscriptAnalysis(StrictModel):
    level: str
    grammar_topics: list[str]
    vocabulary: list[VocabItem]
    key_phrases: list[str]
    factual_statements: list[str]
    example_sentences: list[str]


class SectionPlan(StrictModel):
    component_type: Literal[
        "choose-correct-answer",
        "fill-in-the-blank",
        "match-pairs",
        "yes-no-questions",
    ]
    focus_topic: str
    item_count: int = Field(ge=1, le=50)
    source_material: list[str]


class TestPlan(StrictModel):
    sections: list[SectionPlan]


class Issue(StrictModel):
    severity: Literal["error", "warning"]
    section_id: str
    item_id: str
    issue_type: Literal[
        "incorrect_answer",
        "ambiguous_context",
        "missing_alternative",
        "pedagogical",
    ]
    description: str
    suggestion: str


class EvaluationResult(StrictModel):
    passed: bool
    issues: list[Issue]


class GeneratedSuiteResult(StrictModel):
    language: LanguageDetection
    analysis: TranscriptAnalysis
    plan: TestPlan
    config: list[TestComponentConfig]
    evaluation: EvaluationResult
