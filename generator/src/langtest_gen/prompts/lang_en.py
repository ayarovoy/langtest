from .common import LanguagePromptPack


EN_PACK = LanguagePromptPack(
    analysis_instructions=(
        "Focus on tense usage, articles, prepositions, collocations, and academic vs informal register."
    ),
    grammar_hints=(
        "Disambiguate tense with explicit anchors. Avoid options where two answers are both acceptable "
        "without additional context."
    ),
    ambiguity_checklist=(
        "Flag any item where more than one option can be correct in standard usage. "
        "For blanks requiring verb forms, ensure subject and time are explicit."
    ),
    fill_blank_rules=(
        "Include enough syntactic and semantic context so exactly one grammatical target is expected."
    ),
    comment_language="en",
)
