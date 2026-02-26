import ChooseCorrectAnswerDemo from '../demos/ChooseCorrectAnswerDemo.vue';
import FillInTheBlankDemo from '../demos/FillInTheBlankDemo.vue';
import GeneratedSuitesBrowserDemo from '../demos/GeneratedSuitesBrowserDemo.vue';
import MatchPairsDemo from '../demos/MatchPairsDemo.vue';
import SpanishA1A2IrregularPreteritesSuiteDemo from '../demos/SpanishA1A2IrregularPreteritesSuiteDemo.vue';
import TestSuiteContainerDemo from '../demos/TestSuiteContainerDemo.vue';
import YesNoQuestionsDemo from '../demos/YesNoQuestionsDemo.vue';
export const componentRegistry = [
    {
        id: 'generated-suites-browser',
        title: 'Просмотр сгенерированных наборов',
        description: 'Загружает JSON из generator/fixtures/outputs и рендерит их в TestSuiteContainer.',
        tags: ['generator', 'outputs', 'browser', 'container'],
        component: GeneratedSuitesBrowserDemo,
    },
    {
        id: 'test-suite-container',
        title: 'Контейнер: набор компонентов',
        description: 'Рендерит список тестов динамически по массиву JSON-конфигов.',
        tags: ['container', 'dynamic', 'json'],
        component: TestSuiteContainerDemo,
    },
    {
        id: 'demo-es-a1a2-irregular-preterites-suite',
        title: 'Демо: ES A1–A2 — perfecto vs indefinido (неправильные глаголы)',
        description: '20 упражнений разных типов: pretérito perfecto / pretérito indefinido и их сравнение (лицо всегда указано).',
        tags: ['container', 'es', 'a1', 'a2', 'perfecto', 'indefinido'],
        component: SpanishA1A2IrregularPreteritesSuiteDemo,
    },
    {
        id: 'choose-correct-answer',
        title: 'Выбери правильный ответ',
        description: 'Один и множественный выбор с проверкой ответов.',
        tags: ['single', 'multiple', 'quiz'],
        component: ChooseCorrectAnswerDemo,
    },
    {
        id: 'fill-in-the-blank',
        title: 'Заполни пропуск',
        description: 'Ввод в пропуски с проверкой и показом корректных вариантов.',
        tags: ['input', 'blank', 'text'],
        component: FillInTheBlankDemo,
    },
    {
        id: 'match-pairs',
        title: 'Сопоставь одно с другим',
        description: 'Drag-and-drop ответов в таблицу с проверкой и статистикой.',
        tags: ['match', 'drag-drop', 'table'],
        component: MatchPairsDemo,
    },
    {
        id: 'yes-no-questions',
        title: 'Текст и вопросы ДА/НЕТ',
        description: 'Один или несколько текстов и блок вопросов с выбором ответа ДА/НЕТ.',
        tags: ['reading', 'yes-no', 'comprehension'],
        component: YesNoQuestionsDemo,
    },
];
