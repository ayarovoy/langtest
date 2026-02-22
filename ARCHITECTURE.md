# LangTest Architecture (Agent Quickstart)

## Purpose
- Vue 3 + TypeScript component library for foreign-language testing tasks.
- Current component types:
  - `choose-correct-answer`
  - `fill-in-the-blank`
  - `match-pairs`
- Components are data-driven by JSON and intended for embedding in external projects.

## Runtime and Build
- Stack: Vue 3, Vite, TypeScript.
- Entry:
  - `index.html` -> `src/main.ts` -> `src/App.vue`.
- Dev/test lab shell:
  - `src/lab/ComponentLab.vue`
  - `src/lab/componentRegistry.ts`
- Build command:
  - `npm run build` (`vue-tsc -b && vite build`).

## High-Level Structure
- `src/components/`:
  - individual test components
  - dynamic container and component map
- `src/data/`:
  - JSON configs for demo/test scenarios
- `src/demos/`:
  - adapter views that bind JSON config to components
- `src/types/`:
  - shared config contract for JSON-driven rendering
- `src/utils/`:
  - helper utilities (currently markdown renderer)

## Core Data Contracts
- Central config types: `src/types/test-config.ts`.
- Each config object includes:
  - `id`
  - `componentType`
  - optional `title`
  - optional `descriptionMarkdown`
  - payload by type:
    - `choose-correct-answer` -> `questions`
    - `fill-in-the-blank` -> `texts`
    - `match-pairs` -> `tasks`

## Dynamic Rendering
- Component lookup: `src/components/test-component-map.ts`.
- Container: `src/components/TestSuiteContainer.vue`.
  - Input: `items: TestComponentConfig[]`
  - For each item:
    - choose target component by `componentType`
    - pass type-specific props
    - render as a single ordered list of test blocks

## Component Behavior Summary
- `ChooseCorrectAnswerTest.vue`
  - single/multi choice support
  - check/show/reset/restart controls
  - result highlighting + per-component stats
- `FillInTheBlankTest.vue`
  - inline blanks with answer validation
  - check/show/reset/restart controls
  - supports multiple valid answers per blank
- `MatchPairsTest.vue`
  - table-based matching with drag-drop and touch fallback
  - answer bank with used options hidden
  - customizable column titles via JSON
  - check/show/reset/restart controls

## Markdown Description Pipeline
- Optional section descriptions come from `descriptionMarkdown` in config JSON.
- Rendered inside each component under title via:
  - `src/utils/markdown.ts` (`renderMarkdown()`).
- Supported markdown subset:
  - headings (`#`, `##`, `###`)
  - unordered list (`- `)
  - inline `**bold**`, `*italic*`, `` `code` ``
  - paragraphs and line breaks

## Demo Data
- Per-component config files:
  - `src/data/synthetic-questions.json`
  - `src/data/synthetic-fill-in-the-blank.json`
  - `src/data/synthetic-match-pairs.json`
- Mixed suite config for container:
  - `src/data/synthetic-suite.json`
- Container demo:
  - `src/demos/TestSuiteContainerDemo.vue`

## Styling and UX Conventions
- Local styles are `scoped` per component.
- State colors:
  - correct: green-ish background/border
  - incorrect: pink-ish background/border
- Action buttons pattern reused:
  - `Проверить`, `Показать правильные ответы`, `Сброс`, `Начать заново`

## Important Repo Notes
- Repository currently contains generated `*.js` files next to `.vue/.ts` sources.
- Source of truth is `.vue`, `.ts`, and JSON config files.
- Prefer editing source files, not generated JS artifacts.

## Adding a New Test Component (Checklist)
1. Create component in `src/components/`.
2. Add type mapping in `src/types/test-config.ts`.
3. Register in `src/components/test-component-map.ts`.
4. Extend `getComponentProps()` in `TestSuiteContainer.vue`.
5. Add JSON demo config in `src/data/`.
6. Add demo wrapper in `src/demos/`.
7. Register demo in `src/lab/componentRegistry.ts`.
8. Run `npm run build`.
