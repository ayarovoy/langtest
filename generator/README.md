# LangTest Generator

Python generator that converts a learning-video transcript into JSON configs for the LangTest Vue component library.

## Features

- Multi-stage LLM pipeline (analyze -> plan -> generate -> validate -> evaluate)
- Language-aware prompt packs (dynamic language detection)
- Structural validation against LangTest config contracts
- LLM evaluator for correctness and ambiguity checks
- CLI and Python API

## Quick Start

1. Install:

```bash
cd generator
pip install -e ".[dev]"
```

2. Configure API access:

```bash
cp .env.example .env
```

3. Run:

```bash
langtest-gen generate ../transcript.txt -o ../generated-suite.json
```
