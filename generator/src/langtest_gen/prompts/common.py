from __future__ import annotations

from pydantic import BaseModel


class LanguagePromptPack(BaseModel):
    analysis_instructions: str
    grammar_hints: str
    ambiguity_checklist: str
    fill_blank_rules: str
    comment_language: str


DEFAULT_PACK = LanguagePromptPack(
    analysis_instructions=(
        "Extract grammar topics, useful vocabulary, key phrases, and factual statements "
        "that can be used for comprehension checks."
    ),
    grammar_hints=(
        "Prefer unambiguous sentence context. Keep grammar targets explicit in prompts."
    ),
    ambiguity_checklist=(
        "Reject tasks where more than one answer can reasonably be considered correct unless "
        "alternatives are explicitly listed in correct answers."
    ),
    fill_blank_rules=(
        "When asking for verb forms, include explicit subject, tense marker, or disambiguating context."
    ),
    comment_language="same as transcript language",
)
