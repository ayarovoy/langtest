# GUIDE: генерация JSON для LangTest

Этот документ предназначен для LLM, которая генерирует данные тестов для библиотеки `LangTest` (Vue 3 + TypeScript).

Цель: генерировать **валидный JSON** для:
- отдельной компоненты (`choose-correct-answer`, `fill-in-the-blank`, `match-pairs`);
- контейнерной компоненты (массив из нескольких компонентов разных типов).

---

## 1) Общие правила (обязательно)

1. Возвращай **только JSON** без Markdown-оберток и пояснений.
2. Все `id` должны быть строками и уникальными в своей области:
   - `component.id` уникален в документе;
   - внутри задания уникальны `question.id`, `option.id`, `text.id`, `blank.id`, `task.id`, `row.id`.
3. `componentType` строго один из:
   - `"choose-correct-answer"`
   - `"fill-in-the-blank"`
   - `"match-pairs"`
4. Допустимые необязательные поля:
   - на уровне компоненты: `title`, `descriptionMarkdown`;
   - комментарии к ответам: `commentMarkdown`.
5. Тексты должны быть педагогически корректными для изучения иностранного языка (лексика, грамматика, контекст).
6. Не добавляй лишних полей, которых нет в контракте.

---

## 2) Формат для отдельной компоненты

LLM должна вернуть **один JSON-объект** компоненты.

### 2.1 Choose Correct Answer

```json
{
  "id": "choose-unique-id",
  "componentType": "choose-correct-answer",
  "title": "Опционально",
  "descriptionMarkdown": "Опционально",
  "questions": [
    {
      "id": "q1",
      "text": "Текст вопроса",
      "multiple": false,
      "options": [
        { "id": "q1o1", "text": "Вариант 1", "commentMarkdown": "Опционально" },
        { "id": "q1o2", "text": "Вариант 2" }
      ],
      "correctOptionIds": ["q1o2"]
    }
  ]
}
```

Правила:
- `multiple: false` => в `correctOptionIds` обычно 1 id.
- `multiple: true` => в `correctOptionIds` 2+ id (или 1, если задача это допускает).
- Каждый id из `correctOptionIds` обязан существовать среди `options[].id`.
- В каждом вопросе минимум 2 опции.

### 2.2 Fill In The Blank

```json
{
  "id": "fill-unique-id",
  "componentType": "fill-in-the-blank",
  "title": "Опционально",
  "descriptionMarkdown": "Опционально",
  "texts": [
    {
      "id": "t1",
      "title": "Опционально",
      "content": "I [[b1]] to school and [[b2]] every day.",
      "blanks": [
        { "id": "b1", "correctAnswers": ["go", "walk"], "commentMarkdown": "Опционально" },
        { "id": "b2", "correctAnswers": ["study"] }
      ]
    }
  ]
}
```

Правила:
- Пропуски в `content` задаются только форматом `[[blankId]]`.
- Разрешены id с символами: буквы/цифры/`_`/`-` (например `b1`, `verb_2`, `gap-3`).
- Каждый `[[blankId]]` в `content` должен иметь объект в `blanks` с таким же `id`.
- Каждый `blanks[].id` должен встречаться в `content`.
- `correctAnswers` содержит минимум 1 строку.
- Избегай дублирующихся строк в `correctAnswers`.

### 2.3 Match Pairs

```json
{
  "id": "match-unique-id",
  "componentType": "match-pairs",
  "title": "Опционально",
  "descriptionMarkdown": "Опционально",
  "tasks": [
    {
      "id": "m1",
      "title": "Опционально",
      "leftColumnTitle": "Левая колонка",
      "rightColumnTitle": "Правая колонка",
      "rows": [
        { "id": "r1", "prompt": "Фраза A", "correctOptionId": "o2", "commentMarkdown": "Опционально" },
        { "id": "r2", "prompt": "Фраза B", "correctOptionId": "o1" }
      ],
      "options": [
        { "id": "o1", "text": "Ответ 1" },
        { "id": "o2", "text": "Ответ 2" }
      ]
    }
  ]
}
```

Правила:
- В каждом `task` минимум 2 `rows` и минимум 2 `options`.
- Каждый `rows[].correctOptionId` обязан существовать в `options[].id`.
- Рекомендуется взаимно-однозначное соответствие (без повторного использования одного option для нескольких rows), чтобы задание было корректным и однозначным.

---

## 3) Формат для контейнерной компоненты

LLM должна вернуть **массив JSON-объектов** (не объект), где каждый элемент — конфиг отдельной компоненты.

```json
[
  {
    "id": "suite-choose-1",
    "componentType": "choose-correct-answer",
    "title": "Секция 1",
    "questions": [
      {
        "id": "q1",
        "text": "Выберите правильный вариант",
        "multiple": false,
        "options": [
          { "id": "q1o1", "text": "A" },
          { "id": "q1o2", "text": "B" }
        ],
        "correctOptionIds": ["q1o2"]
      }
    ]
  },
  {
    "id": "suite-fill-1",
    "componentType": "fill-in-the-blank",
    "title": "Секция 2",
    "texts": [
      {
        "id": "t1",
        "content": "They [[b1]] late yesterday.",
        "blanks": [{ "id": "b1", "correctAnswers": ["arrived"] }]
      }
    ]
  },
  {
    "id": "suite-match-1",
    "componentType": "match-pairs",
    "title": "Секция 3",
    "tasks": [
      {
        "id": "m1",
        "rows": [
          { "id": "r1", "prompt": "Hello", "correctOptionId": "o1" },
          { "id": "r2", "prompt": "Goodbye", "correctOptionId": "o2" }
        ],
        "options": [
          { "id": "o1", "text": "Привет" },
          { "id": "o2", "text": "Пока" }
        ]
      }
    ]
  }
]
```

Правила для контейнера:
- Корневой тип: массив.
- Каждый элемент массива должен быть валидным объектом одного из 3 типов.
- `id` элементов массива не должны повторяться.
- Можно смешивать типы компонентов в любом порядке.

---

## 4) Мини-чеклист самопроверки для LLM

Перед финальным ответом проверь:
- JSON парсится без ошибок.
- Нет комментариев, trailing commas, `undefined`.
- Все ссылки по id валидны:
  - `correctOptionIds` -> `options.id`;
  - `[[blankId]]` <-> `blanks.id`;
  - `correctOptionId` -> `options.id`.
- Нет пустых массивов в обязательных списках (`questions`, `texts`, `tasks`, `rows`, `options`, `correctAnswers`).
- Контент соответствует учебной задаче по иностранному языку.

---

## 5) Готовый текст-инструкция для вставки в промт LLM

Скопируй и используй как системный/служебный блок:

```text
Сгенерируй данные для LangTest в формате JSON.
Верни только JSON, без Markdown и пояснений.

Допустимые componentType:
- choose-correct-answer
- fill-in-the-blank
- match-pairs

Если просят ОТДЕЛЬНУЮ компоненту — верни один JSON-объект.
Если просят КОНТЕЙНЕР — верни JSON-массив объектов компонентов.

Обязательные правила:
1) Все id строковые и валидные, уникальные в своей области.
2) Никаких полей вне контракта.
3) choose-correct-answer:
   - questions[] -> { id, text, multiple, options[], correctOptionIds[] }
   - каждый id из correctOptionIds обязан существовать в options[].id
4) fill-in-the-blank:
   - texts[] -> { id, content, blanks[] }
   - пропуски в content только как [[blankId]]
   - каждый [[blankId]] должен быть в blanks.id и наоборот
   - blanks[].correctAnswers содержит минимум 1 ответ
5) match-pairs:
   - tasks[] -> { id, rows[], options[] }
   - rows[] -> { id, prompt, correctOptionId }
   - каждый correctOptionId обязан существовать в options[].id
6) Итоговый JSON должен парситься без ошибок.
```
