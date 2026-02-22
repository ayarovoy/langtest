import type { Component } from 'vue'
import ChooseCorrectAnswerDemo from '../demos/ChooseCorrectAnswerDemo.vue'
import FillInTheBlankDemo from '../demos/FillInTheBlankDemo.vue'
import MatchPairsDemo from '../demos/MatchPairsDemo.vue'
import TestSuiteContainerDemo from '../demos/TestSuiteContainerDemo.vue'

export interface ComponentLabEntry {
  id: string
  title: string
  description: string
  tags: string[]
  component: Component
}

export const componentRegistry: ComponentLabEntry[] = [
  {
    id: 'test-suite-container',
    title: 'Контейнер: набор компонентов',
    description: 'Рендерит список тестов динамически по массиву JSON-конфигов.',
    tags: ['container', 'dynamic', 'json'],
    component: TestSuiteContainerDemo,
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
]
