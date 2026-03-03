# Редактор JSON сюита — состояние разработки

Редактор JSON-данных для контейнера `TestSuiteContainer`. Позволяет создавать и редактировать массив компонентов тестов (`TestComponentConfig[]`).

## Структура файлов

```
src/components/
├── SuiteJsonEditor.vue       # Основной редактор списка компонентов
├── MarkdownEditor.vue        # Универсальный редактор Markdown (текст / предпросмотр)
└── editors/
    └── ChooseCorrectAnswerEditor.vue   # Специализированный редактор для choose-correct-answer

src/demos/
└── SuiteJsonEditorDemo.vue   # Демо-приложение редактора
```

## Что сделано

### Основной редактор (SuiteJsonEditor)

- **Отображение массива компонентов** — каждый компонент в раскрываемой панели (Element Plus Collapse)
- **Редактируемый заголовок** — поле `title` редактируется в шапке панели (не в JSON)
- **Добавление компонента** — выбор типа (choose-correct-answer, fill-in-the-blank, match-pairs, yes-no-questions) + кнопка «Добавить»
- **Удаление** — кнопка-корзина в шапке каждого элемента (с безопасным отступом от стрелки раскрытия)
- **Перемещение** — drag-and-drop мышью через handle `⋮⋮`
- **Подсветка drop-зоны** — активный target при перетаскивании подсвечивается
- **Undo / Redo** — история до 50 шагов; не сбрасывается при emit (только при внешнем изменении `modelValue`)
- **API** — `getJson(): string` через `defineExpose`
- **Поддержка v-model** — `modelValue` и `update:modelValue`

### Редактор компонента choose-correct-answer

- **Описание (Markdown)** — отдельный блок с `MarkdownEditor`:
  - режим «Текст» — textarea с raw markdown
  - режим «Предпросмотр» — split view: текст слева, рендер справа (через `renderMarkdown`)
- **Основные атрибуты** — отдельные поля:
  - `id` (текстовое поле)
  - `answerLayout` (`vertical` / `horizontal` / `auto`)
- `answerLayoutHeuristics` убран из интерфейса редактора
- **Список вопросов** вынесен из JSON в отдельный вложенный `collapse` (с отступом вправо)
- Заголовок вопроса формируется из текста вопроса, в шапке показывается ограниченный preview с `...`
- Для вопросов доступны операции:
  - добавление
  - удаление (кнопка-корзина, с отступом от стрелки раскрытия)
  - drag-and-drop перемещение мышью через handle `⋮⋮`
  - подсветка drop-зоны при перетаскивании
  - при раскрытии вопроса — редактирование основных атрибутов (`id`, `text`, `multiple`)
- **Редактор ответов** внутри вопроса:
  - список строк с полями в одну линию: `id`, `text`, `правильность` (checkbox)
  - добавление и удаление (кнопка-корзина)
  - перемещение ответов drag-and-drop мышью в пределах текущего вопроса
  - при `multiple=false` поддерживается ровно один правильный ответ
  - отдельный блок `correctOptionIds` отсутствует — формируется автоматически на основе чекбоксов
  - поддержка `commentMarkdown` для ответа:
    - кнопка `?` в строке ответа (яркая, если комментарий задан)
    - hover-tooltip: рендер markdown комментария или текст «Комментарий не задан»
    - click по `?` открывает диалог с `MarkdownEditor` для редактирования
- Поля `title`, `descriptionMarkdown`, `id`, `answerLayout`, `questions` и ответы вопросов редактируются через структурированный UI (без JSON-блока «остальные атрибуты»)

### Демо (SuiteJsonEditorDemo)

- **Предпросмотр** — диалог с `TestSuiteContainer`, можно выполнять тест
- **Выгрузить JSON** — скачивание текущего JSON в файл
- Начальные данные из `synthetic-suite.json`

### Зависимости

- Element Plus (collapsed, buttons, select, dialog, radio-group и т.д.)
- Без внешних библиотек для markdown (используется `src/utils/markdown.ts`)

---

## Что нужно доделать

### Специализированные редакторы для остальных типов

Сейчас для `fill-in-the-blank`, `match-pairs` и `yes-no-questions` используется примитивный textarea с JSON.

| Тип компонента      | Статус                 | План                                                                 |
|---------------------|------------------------|----------------------------------------------------------------------|
| choose-correct-answer | ✅ Готов               | —                                                                    |
| fill-in-the-blank   | ⏳ Примитивный JSON    | Редактор с Markdown для `descriptionMarkdown`, остальное — в JSON    |
| match-pairs         | ⏳ Примитивный JSON    | Редактор с Markdown для `descriptionMarkdown`, остальное — в JSON    |
| yes-no-questions    | ⏳ Примитивный JSON    | Редактор с Markdown для `descriptionMarkdown`, остальное — в JSON    |

### Валидация

- **JSON** — проверяется только синтаксис
- **Схема** — нет проверки соответствия `TestComponentConfig` (обязательные поля, типы, структура)
- **Дубликаты id** — не проверяются

### Предпросмотр

- Работает в диалоге
- Нет сохранения/восстановления состояния теста в предпросмотре
- Нет отдельного окна (открывается в том же приложении)

### UX

- Нет горячих клавиш (Ctrl+Z / Ctrl+Y для undo/redo)
- Нет подтверждения при удалении компонента
- Нет загрузки JSON из файла (только начальные данные и экспорт)

### Интеграция

- Редактор экспортируется из `src/index.ts` и доступен через `LangTestPlugin`
- Подключение Element Plus в хост-приложении обязательно

---

## Использование API

```ts
import { SuiteJsonEditor } from 'langtest'

// Получить текущий JSON
const json = editorRef.value?.getJson()

// Двусторонняя привязка
<SuiteJsonEditor v-model="items" />
```

---

## Чеклист для новых подредакторов

При добавлении специализированного редактора для типа компонента:

1. Создать `src/components/editors/<TypeName>Editor.vue`
2. Props: `modelValue: <ConfigType>`, Emits: `update:modelValue`
3. Вынести `descriptionMarkdown` в `MarkdownEditor`
4. Сделать структурированный UI для ключевых полей; JSON textarea использовать только при необходимости
5. Добавить условие в `SuiteJsonEditor.vue`: `v-if="item.componentType === '<type>'"`
6. В `syncLocalJsonFromItems` исключить этот тип из обновления `localJsonByKey`
