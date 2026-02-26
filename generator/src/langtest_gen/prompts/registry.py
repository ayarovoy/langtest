from __future__ import annotations

from .common import DEFAULT_PACK, LanguagePromptPack
from .lang_de import DE_PACK
from .lang_en import EN_PACK
from .lang_es import ES_PACK
from .lang_fr import FR_PACK

_LANGUAGE_PROMPTS: dict[str, LanguagePromptPack] = {
    "default": DEFAULT_PACK,
    "es": ES_PACK,
    "en": EN_PACK,
    "de": DE_PACK,
    "fr": FR_PACK,
}


def get_prompt_pack(lang_code: str) -> LanguagePromptPack:
    return _LANGUAGE_PROMPTS.get(lang_code.lower(), _LANGUAGE_PROMPTS["default"])
