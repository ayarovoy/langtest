from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path
from typing import Any

import click
from rich.console import Console

from langtest_gen import save_suite
from langtest_gen.config import Settings
from langtest_gen.logging_utils import configure_logging
from langtest_gen.pipeline import generate_test_suite
from langtest_gen.validators import parse_component, validate_suite

console = Console()


def _read_transcript(path_or_dash: str) -> str:
    if path_or_dash == "-":
        return sys.stdin.read()
    return Path(path_or_dash).read_text(encoding="utf-8")


def _settings_from_options(**kwargs: Any) -> Settings:
    values = {key: value for key, value in kwargs.items() if value is not None}
    return Settings(**values)


@click.group()
def main() -> None:
    """LangTest generator CLI."""


@main.command()
@click.argument("transcript_path", type=str)
@click.option("-o", "--output", "output_path", required=True, type=str, help="Output JSON path")
@click.option("--provider", type=click.Choice(["openrouter", "deepseek", "custom"]), default=None)
@click.option("--model", type=str, default=None)
@click.option("--base-url", type=str, default=None)
@click.option("--api-key", type=str, default=None)
@click.option("--max-retries", type=int, default=None)
@click.option("--chunk-token-limit", type=int, default=None)
@click.option("--log-level", type=click.Choice(["DEBUG", "INFO", "WARNING", "ERROR"]), default=None)
def generate(
    transcript_path: str,
    output_path: str,
    provider: str | None,
    model: str | None,
    base_url: str | None,
    api_key: str | None,
    max_retries: int | None,
    chunk_token_limit: int | None,
    log_level: str | None,
) -> None:
    """Generate LangTest suite from transcript."""

    transcript = _read_transcript(transcript_path)
    settings = _settings_from_options(
        provider=provider,
        model=model,
        base_url=base_url,
        api_key=api_key,
        max_retries=max_retries,
        chunk_token_limit=chunk_token_limit,
        log_level=log_level,
    )
    configure_logging(settings.log_level)

    console.print("[bold]Generating suite...[/bold]")
    result = asyncio.run(generate_test_suite(transcript, settings=settings))
    save_suite(result, output_path)
    console.print(f"[green]Saved suite to[/green] {output_path}")
    console.print(f"Language: {result.language.code} ({result.language.confidence:.2f})")
    console.print(f"Sections: {len(result.config)}")
    if result.evaluation.issues:
        console.print(f"[yellow]Evaluator issues:[/yellow] {len(result.evaluation.issues)}")
    else:
        console.print("[green]Evaluator passed with no issues.[/green]")


@main.command()
@click.argument("suite_path", type=str)
def validate(suite_path: str) -> None:
    """Validate existing LangTest suite JSON."""

    raw = json.loads(Path(suite_path).read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise click.ClickException("Suite JSON must be an array of components.")
    components = [parse_component(item) for item in raw]
    validate_suite(components)
    console.print("[green]Suite structure is valid.[/green]")
