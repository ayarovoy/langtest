import AnswerCommentPopover from './components/AnswerCommentPopover.vue';
import ChooseCorrectAnswerTest from './components/ChooseCorrectAnswerTest.vue';
import FillInTheBlankTest from './components/FillInTheBlankTest.vue';
import MatchPairsTest from './components/MatchPairsTest.vue';
import TestSuiteContainer from './components/TestSuiteContainer.vue';
export { AnswerCommentPopover, ChooseCorrectAnswerTest, FillInTheBlankTest, MatchPairsTest, TestSuiteContainer, };
export * from './types/component-contracts';
export * from './types/test-config';
export const LangTestPlugin = {
    install(app) {
        app.component('AnswerCommentPopover', AnswerCommentPopover);
        app.component('ChooseCorrectAnswerTest', ChooseCorrectAnswerTest);
        app.component('FillInTheBlankTest', FillInTheBlankTest);
        app.component('MatchPairsTest', MatchPairsTest);
        app.component('TestSuiteContainer', TestSuiteContainer);
    },
};
export default LangTestPlugin;
