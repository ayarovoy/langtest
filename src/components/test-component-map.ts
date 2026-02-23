import type { Component } from 'vue'
import ChooseCorrectAnswerTest from './ChooseCorrectAnswerTest.vue'
import FillInTheBlankTest from './FillInTheBlankTest.vue'
import MatchPairsTest from './MatchPairsTest.vue'
import YesNoQuestionsTest from './YesNoQuestionsTest.vue'
import type { TestComponentType } from '../types/test-config'

export const testComponentMap: Record<TestComponentType, Component> = {
  'choose-correct-answer': ChooseCorrectAnswerTest,
  'fill-in-the-blank': FillInTheBlankTest,
  'match-pairs': MatchPairsTest,
  'yes-no-questions': YesNoQuestionsTest,
}
