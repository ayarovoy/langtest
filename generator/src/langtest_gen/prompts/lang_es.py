from .common import LanguagePromptPack


ES_PACK = LanguagePromptPack(
    analysis_instructions=(
        "Focus on Spanish-specific contrasts: pretérito perfecto vs indefinido vs imperfecto, "
        "ser/estar, por/para, subjuntivo vs indicativo, irregular verb forms, and tense markers."
    ),
    grammar_hints=(
        "For A1-A2 tasks prefer explicit time markers (hoy, ayer, esta semana, la semana pasada). "
        "Avoid region-dependent formulations unless context resolves them."
    ),
    ambiguity_checklist=(
        "For fill-in-the-blank verb tasks require explicit subject/person cues. "
        "Flag prompts like '______ al cine' as ambiguous unless person is inferable. "
        "For perfecto/indefinido decisions require a clear temporal anchor."
    ),
    fill_blank_rules=(
        "Use explicit subject and temporal markers for conjugation tasks. "
        "Include alternative acceptable forms only when they are truly equivalent in context."
    ),
    comment_language="es",
)
