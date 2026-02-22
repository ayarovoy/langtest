import ChooseCorrectAnswerTest from '../components/ChooseCorrectAnswerTest.vue';
import importedQuestions from '../data/synthetic-questions.json';
const config = importedQuestions;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {[typeof ChooseCorrectAnswerTest, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ChooseCorrectAnswerTest, new ChooseCorrectAnswerTest({
    title: (__VLS_ctx.config.title),
    questions: (__VLS_ctx.config.questions),
}));
const __VLS_1 = __VLS_0({
    title: (__VLS_ctx.config.title),
    questions: (__VLS_ctx.config.questions),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
var __VLS_2;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChooseCorrectAnswerTest: ChooseCorrectAnswerTest,
            config: config,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
