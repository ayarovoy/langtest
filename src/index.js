import AnswerCommentPopover from './components/AnswerCommentPopover.vue';
import ChooseCorrectAnswerTest from './components/ChooseCorrectAnswerTest.vue';
import FillInTheBlankTest from './components/FillInTheBlankTest.vue';
import MatchPairsTest from './components/MatchPairsTest.vue';
import SuiteJsonEditor from './components/SuiteJsonEditor.vue';
import TestSuiteContainer from './components/TestSuiteContainer.vue';
import YesNoQuestionsTest from './components/YesNoQuestionsTest.vue';
export { AnswerCommentPopover, ChooseCorrectAnswerTest, FillInTheBlankTest, MatchPairsTest, SuiteJsonEditor, TestSuiteContainer, YesNoQuestionsTest, };
export * from './types/component-contracts';
export * from './types/test-config';
export * from './types/test-state';
export const LangTestPlugin = {
    install(app) {
        app.component('AnswerCommentPopover', AnswerCommentPopover);
        app.component('ChooseCorrectAnswerTest', ChooseCorrectAnswerTest);
        app.component('FillInTheBlankTest', FillInTheBlankTest);
        app.component('MatchPairsTest', MatchPairsTest);
        app.component('SuiteJsonEditor', SuiteJsonEditor);
        app.component('YesNoQuestionsTest', YesNoQuestionsTest);
        app.component('TestSuiteContainer', TestSuiteContainer);
    },
};
export default LangTestPlugin;
