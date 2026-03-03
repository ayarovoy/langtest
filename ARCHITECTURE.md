# LangTest Architecture (Agent Quickstart)

## Purpose
- Vue 3 + TypeScript component library for foreign-language testing tasks.
- Current component types:
  - `choose-correct-answer`
  - `fill-in-the-blank`
  - `match-pairs`
  - `yes-no-questions`
- Components are data-driven by JSON and intended for embedding in external projects.

## Runtime and Build
- Stack: Vue 3, Vite, TypeScript.
- Entry:
  - `index.html` -> `src/main.ts` -> `src/App.vue`.
- Library entry:
  - `src/index.ts` (public exports + optional Vue plugin installer).
- Dev/test lab shell:
  - `src/lab/ComponentLab.vue`
  - `src/lab/componentRegistry.ts`
  - demo app registers components through `LangTestPlugin` from `src/index.ts` (library-first usage)
- Build command:
  - `npm run build` (library bundle + declaration files).
  - `npm run build:demo` (standalone demo app build).

## High-Level Structure
- `src/components/`:
  - individual test components
  - dynamic container and component map
- `src/data/`:
  - JSON configs for demo/test scenarios
- `src/demos/`:
  - adapter views that bind JSON config to components through the package public API
- `src/types/`:
  - shared config contract for JSON-driven rendering
  - component payload contracts independent from `.vue` files
- `src/utils/`:
  - helper utilities (currently markdown renderer)

## Core Data Contracts
- Central config types: `src/types/test-config.ts`.
- Component payload types: `src/types/component-contracts.ts`.
- Each config object includes:
  - `id`
  - `componentType`
  - optional `title`
  - optional `descriptionMarkdown`
  - for `choose-correct-answer`: optional `answerLayout` (`vertical` | `horizontal` | `auto`)
  - for `choose-correct-answer`: optional `answerLayoutHeuristics` thresholds for auto mode
  - optional answer-level `commentMarkdown` fields in task payloads (supports markdown)
  - payload by type:
    - `choose-correct-answer` -> `questions`
    - `fill-in-the-blank` -> `texts`
    - `match-pairs` -> `tasks`
    - `yes-no-questions` -> `tasks`

## Dynamic Rendering
- Component lookup: `src/components/test-component-map.ts`.
- Container: `src/components/TestSuiteContainer.vue`.
  - Input: `items: TestComponentConfig[]`
  - Optional input: `initialState?: TestSuiteState`
  - For each item:
    - choose target component by `componentType`
    - pass type-specific props
    - render as a single ordered list of test blocks
  - collects child `progress-change` events and shows combined summary progress
  - exposes `getState()` / `setState(state)` for external persistence flows
  - emits `state-change` with the full `TestSuiteState` snapshot

## Component Behavior Summary
- `ChooseCorrectAnswerTest.vue`
  - single/multi choice support
  - answer list layout modes: vertical, horizontal (wrap), auto (heuristic-based per question)
  - per-question completion marker (`✓`) when at least one option is selected
  - local progress bar (hidden inside suite container)
  - "Правильно: X из Y" is shown near progress and counts only after `Проверить` (`Y=0` before check)
  - check/show/reset/restart controls
  - result highlighting + per-component stats
  - after "show correct answers", optional `?` popover on options with `commentMarkdown`
- `FillInTheBlankTest.vue`
  - inline blanks with answer validation
  - per-text completion marker (`✓`) when all blanks are filled
  - local progress bar (hidden inside suite container)
  - "Правильно: X из Y" is shown near progress and counts only after `Проверить` (`Y=0` before check)
  - check/show/reset/restart controls
  - supports multiple valid answers per blank
  - after "show correct answers", optional `?` popover on blanks with `commentMarkdown`
- `MatchPairsTest.vue`
  - table-based matching with drag-drop and touch support
  - per-table completion marker (`✓`) when all rows have assigned answers
  - local progress bar (hidden inside suite container)
  - "Правильно: X из Y" is shown near progress and counts only after `Проверить` (`Y=0` before check)
  - answer bank with used options hidden
  - assigned answers can be moved between rows and returned back to answer bank (desktop + mobile)
  - customizable column titles via JSON
  - check/show/reset/restart controls
  - after "show correct answers", optional `?` popover on rows with `commentMarkdown`
- `YesNoQuestionsTest.vue`
  - one or more tasks, each with a single `textMarkdown` block followed by true/false style questions (`ДА` / `НЕТ`)
  - per-task completion marker (`✓`) when all yes/no questions are answered
  - local progress bar (hidden inside suite container)
  - "Правильно: X из Y" is shown near progress and counts only after `Проверить` (`Y=0` before check)
  - per-question answer buttons aligned to the right
  - check/show/reset/restart controls

## Markdown Rendering Pipeline
- Optional section descriptions come from `descriptionMarkdown` in config JSON.
- Optional answer comments come from `commentMarkdown` in options/blanks/rows.
- Both are rendered inside components via:
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
  - `src/data/synthetic-yes-no-questions.json`
- Mixed suite config for container:
  - `src/data/synthetic-suite.json`
- Container demo:
  - `src/demos/TestSuiteContainerDemo.vue`

## Styling and UX Conventions
- Local styles are `scoped` per component.
- Theme-friendly CSS custom properties are supported (`--lt-*` tokens).
- Demo lab includes 3 theme presets:
  - light
  - deep-blue
  - dark
- State colors:
  - correct: green-ish background/border
  - incorrect: pink-ish background/border
- Action buttons pattern reused:
  - `Проверить`, `Показать правильные ответы`, `Сброс`, `Начать заново`

## State Persistence API
- State contracts are in `src/types/test-state.ts` and exported from `src/index.ts`.
- All test components support:
  - prop `initialState`
  - event `state-change`
  - exposed methods `getState()` / `setState(state)`
- `TestSuiteContainer` aggregates child snapshots into `TestSuiteState`.
- Library API is storage-agnostic: saving/loading strategy (`localStorage`, IndexedDB, backend API) is owned by the host application.

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
