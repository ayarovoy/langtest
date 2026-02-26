from .common import LanguagePromptPack


DE_PACK = LanguagePromptPack(
    analysis_instructions=(
        "Focus on case government, article declension, verb position (V2/final), separable prefixes, "
        "and tense/aspect usage relevant to learner level."
    ),
    grammar_hints=(
        "Ensure sentence position and case cues are explicit for grammatical target items."
    ),
    ambiguity_checklist=(
        "Flag blanks where case, number, or person cannot be deduced from context. "
        "Avoid prompts that allow multiple equally valid word orders unless all are accepted."
    ),
    fill_blank_rules=(
        "Provide clear governing elements (prepositions/articles/subject) for case and conjugation tasks."
    ),
    comment_language="de",
)
