from __future__ import annotations

from typing import Literal

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


Provider = Literal["openrouter", "deepseek", "custom"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="LANGTEST_GEN_", extra="ignore")

    provider: Provider = "openrouter"
    api_key: str = Field(default="")
    model: str = "deepseek/deepseek-chat-v3-0324"
    base_url: str | None = None
    temperature: float = 0.2
    max_retries: int = 2
    chunk_token_limit: int = 8000
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"

    def resolved_base_url(self) -> str:
        if self.base_url:
            return self.base_url
        if self.provider == "openrouter":
            return "https://openrouter.ai/api/v1"
        if self.provider == "deepseek":
            return "https://api.deepseek.com/v1"
        raise ValueError("base_url is required for provider='custom'")


def make_llm(
    settings: Settings,
    *,
    temperature: float | None = None,
    model: str | None = None,
) -> object:
    from langchain_openai import ChatOpenAI

    if not settings.api_key:
        raise ValueError("API key is missing. Set LANGTEST_GEN_API_KEY or pass api_key explicitly.")

    return ChatOpenAI(
        model=model or settings.model,
        base_url=settings.resolved_base_url(),
        api_key=settings.api_key,
        temperature=settings.temperature if temperature is None else temperature,
    )
