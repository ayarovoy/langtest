# LangTest

Vue 3 + TypeScript библиотека компонентов для языковых тестов:
- выбор правильного варианта;
- заполнение пропусков;
- сопоставление пар;
- чтение текста с вопросами ДА/НЕТ;
- динамический контейнер для смешанных тестов из JSON.

Библиотека ориентирована на встраивание во внешние проекты и удобную кастомизацию через CSS.

## Возможности

- Готовые компоненты тестов:
  - `ChooseCorrectAnswerTest`
  - `FillInTheBlankTest`
  - `MatchPairsTest`
  - `YesNoQuestionsTest`
  - `TestSuiteContainer` (рендер смешанного набора компонентов по `componentType`)
- Единый JSON-контракт для data-driven рендера
- TypeScript-типы для payload и контейнера
- Поддержка `descriptionMarkdown` и `commentMarkdown`
- Scoped CSS внутри компонентов + токены через CSS custom properties (`--lt-*`)

## Architecture Notes

- **Public API first**: внешние проекты и demo используют только `src/index.ts` (`langtest`), без импортов из внутренних путей `src/components/*`.
- **Data-driven rendering**: `TestSuiteContainer` принимает `TestComponentConfig[]` и выбирает компонент по `componentType`.
- **Contracts split**:
  - `src/types/component-contracts.ts` — payload-типы для задач (`TestQuestion`, `FillTextTask`, `MatchTask`, `YesNoTask`).
  - `src/types/test-config.ts` — контейнерный union-конфиг (`TestComponentConfig` и варианты).
- **Styling model**: компоненты используют scoped CSS, но ключевые цвета/бордеры/радиусы вынесены в токены `--lt-*`, что позволяет быстро менять тему без форка компонентов.
- **Interaction model**:
  - `MatchPairsTest` поддерживает drag-and-drop и touch.
  - Назначенные ответы можно перемещать между ячейками и возвращать обратно в банк ответов (desktop + mobile).
- `YesNoQuestionsTest` рендерит один или несколько текстов и блок вопросов с ответами ДА/НЕТ.
- **Build split**:
  - `npm run build` — библиотечная сборка (bundle + `.d.ts`).
  - `npm run build:demo` — отдельная сборка demo-приложения.

## Требования

- Vue `^3.5.0`
- Node.js 18+

## Установка

```bash
npm install langtest
```

Или временно из git/tarball в ваш проект:

```bash
npm install <path-or-git-url>
```

## Быстрый старт

### Вариант 1: локальный импорт компонентов

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { TestSuiteContainer } from 'langtest'
import 'langtest/style.css'

const app = createApp(App)
app.component('TestSuiteContainer', TestSuiteContainer)
app.mount('#app')
```

### Вариант 2: установка плагином

```ts
import { createApp } from 'vue'
import App from './App.vue'
import LangTestPlugin from 'langtest'
import 'langtest/style.css'

createApp(App).use(LangTestPlugin).mount('#app')
```

## Использование контейнера

`TestSuiteContainer` принимает массив `items: TestComponentConfig[]` и рендерит нужный компонент по полю `componentType`.

```vue
<template>
  <TestSuiteContainer :items="suite" />
</template>

<script setup lang="ts">
import { TestSuiteContainer } from 'langtest'
import type { TestComponentConfig } from 'langtest'

const suite: TestComponentConfig[] = [
  {
    id: 'choose-1',
    componentType: 'choose-correct-answer',
    title: 'Выбери правильный ответ',
    questions: [
      {
        id: 'q1',
        text: 'I ___ to school yesterday.',
        multiple: false,
        options: [
          { id: 'o1', text: 'go' },
          { id: 'o2', text: 'went', commentMarkdown: '**Past Simple** форма глагола go.' },
        ],
        correctOptionIds: ['o2'],
      },
    ],
  },
  {
    id: 'fill-1',
    componentType: 'fill-in-the-blank',
    title: 'Заполни пропуск',
    texts: [
      {
        id: 't1',
        content: 'They [[b1]] late yesterday.',
        blanks: [{ id: 'b1', correctAnswers: ['arrived'] }],
      },
    ],
  },
]
</script>
```

## Использование отдельных компонентов

Можно использовать каждый компонент напрямую:

- `ChooseCorrectAnswerTest` с `questions`
- `FillInTheBlankTest` с `texts`
- `MatchPairsTest` с `tasks`
- `YesNoQuestionsTest` с `tasks`

Все компоненты поддерживают:
- `title?: string`
- `descriptionMarkdown?: string`

## Публичные типы

Импортируются из корня пакета:

```ts
import type {
  TestComponentConfig,
  ChooseCorrectAnswerConfig,
  FillInTheBlankConfig,
  MatchPairsConfig,
  YesNoQuestionsConfig,
  TestQuestion,
  FillTextTask,
  MatchTask,
  YesNoTask,
} from 'langtest'
```

## Контракт JSON

`componentType`:
- `choose-correct-answer`
- `fill-in-the-blank`
- `match-pairs`
- `yes-no-questions`

### choose-correct-answer

- `questions[]`:
  - `id`, `text`, `multiple`, `options[]`, `correctOptionIds[]`
- `correctOptionIds` должны ссылаться на `options[].id`

### fill-in-the-blank

- `texts[]`:
  - `id`, `content`, `blanks[]`
- Пропуски в `content` задаются как `[[blankId]]`
- Каждый `[[blankId]]` должен существовать в `blanks.id`

### match-pairs

- `tasks[]`:
  - `id`, `rows[]`, `options[]`
- `rows[].correctOptionId` должен ссылаться на `options[].id`

### yes-no-questions

- `tasks[]`:
  - `id`, `texts[]`, `questions[]`
- `questions[]`:
  - `id`, `text`, `correctAnswer` (`true` для ДА, `false` для НЕТ)

## Кастомизация стилей (главное)

Базовые стили инкапсулированы в компонентах, но цвета, рамки и радиусы можно переопределять через CSS-переменные.

### 1) Добавьте класс-обертку вокруг теста

```vue
<template>
  <section class="lesson-theme">
    <TestSuiteContainer :items="suite" />
  </section>
</template>
```

### 2) Переопределите `--lt-*` переменные

```css
.lesson-theme {
  --lt-color-primary: #5b21b6;
  --lt-color-primary-contrast: #ffffff;

  --lt-color-secondary-bg: #ffffff;
  --lt-color-secondary-border: #d4d4d8;
  --lt-color-secondary-text: #111827;

  --lt-color-card-bg: #ffffff;
  --lt-color-card-border: #e5e7eb;
  --lt-color-text-muted: #334155;
  --lt-color-text-secondary: #475569;

  --lt-color-correct-bg: #dcfce7;
  --lt-color-correct-border: #22c55e;
  --lt-color-correct-strong: #15803d;

  --lt-color-incorrect-bg: #ffe4e6;
  --lt-color-incorrect-border: #fb7185;
  --lt-color-incorrect-text: #be123c;

  --lt-color-input-border: #94a3b8;
  --lt-color-table-border: #e2e8f0;
  --lt-color-table-header-bg: #f8fafc;
  --lt-color-dropzone-border: #cbd5e1;

  --lt-color-popover-bg: #ffffff;
  --lt-color-popover-border: #d1d5db;
  --lt-color-popover-trigger-bg: #ffffff;
  --lt-color-popover-trigger-border: #94a3b8;
  --lt-color-popover-trigger-text: #334155;

  --lt-radius-card: 14px;
  --lt-radius-control: 10px;
}
```

### 3) Когда нужны точечные правки

Дополнительно можно переопределить конкретные классы компонентов:
- `.test__check-btn`
- `.fill-test__input`
- `.match-test__answer-chip`
- `.comment-popover__panel`

Если проект использует CSS Modules или scoped-стили, размещайте переопределения в глобальном слое темы (например, в `app.css`/`theme.css`).

## Рекомендации по встраиванию

- Данные тестов храните отдельно от UI (например, в CMS/JSON/API), а в компонент отдавайте уже валидный JSON.
- Перед рендером валидируйте структуру (`id`, связи между `correctOptionIds`/`correctOptionId` и `options`).
- Для мультиязычных платформ можно на уровне вашего приложения локализовать заголовки секций и данные тестов.

## Локальная разработка библиотеки

```bash
npm install
npm run dev
```

Сборка библиотеки:

```bash
npm run build
```

Сборка demo-приложения:

```bash
npm run build:demo
```

## Экспорт пакета

Публичный API:
- Компоненты: `AnswerCommentPopover`, `ChooseCorrectAnswerTest`, `FillInTheBlankTest`, `MatchPairsTest`, `YesNoQuestionsTest`, `TestSuiteContainer`
- Плагин: `default` и `LangTestPlugin`
- Типы: `TestComponentConfig` и payload-типы

Стили:
- `langtest/style.css`
