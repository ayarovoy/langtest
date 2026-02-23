import type { App } from 'vue'
import AnswerCommentPopover from './components/AnswerCommentPopover.vue'
import ChooseCorrectAnswerTest from './components/ChooseCorrectAnswerTest.vue'
import FillInTheBlankTest from './components/FillInTheBlankTest.vue'
import MatchPairsTest from './components/MatchPairsTest.vue'
import TestSuiteContainer from './components/TestSuiteContainer.vue'
import YesNoQuestionsTest from './components/YesNoQuestionsTest.vue'

export {
  AnswerCommentPopover,
  ChooseCorrectAnswerTest,
  FillInTheBlankTest,
  MatchPairsTest,
  TestSuiteContainer,
  YesNoQuestionsTest,
}

export * from './types/component-contracts'
export * from './types/test-config'

export const LangTestPlugin = {
  install(app: App): void {
    app.component('AnswerCommentPopover', AnswerCommentPopover)
    app.component('ChooseCorrectAnswerTest', ChooseCorrectAnswerTest)
    app.component('FillInTheBlankTest', FillInTheBlankTest)
    app.component('MatchPairsTest', MatchPairsTest)
    app.component('YesNoQuestionsTest', YesNoQuestionsTest)
    app.component('TestSuiteContainer', TestSuiteContainer)
  },
}

export default LangTestPlugin
