from .common import LanguagePromptPack


FR_PACK = LanguagePromptPack(
    analysis_instructions=(
        "Focus on tense contrasts (passé composé/imparfait), agreement, article/partitive usage, "
        "and high-frequency connectors."
    ),
    grammar_hints=(
        "When testing verb forms, make person/number and temporal framing explicit."
    ),
    ambiguity_checklist=(
        "Flag prompts where several verb forms or articles are acceptable due to missing context. "
        "Require lexical and grammatical cues for a single expected answer set."
    ),
    fill_blank_rules=(
        "Ensure blanks contain sufficient clues for agreement, tense, and article choice."
    ),
    comment_language="fr",
)
