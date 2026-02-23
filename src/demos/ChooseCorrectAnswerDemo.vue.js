import importedQuestions from '../data/synthetic-questions.json';
const config = importedQuestions;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.ChooseCorrectAnswerTest;
/** @type {[typeof __VLS_components.ChooseCorrectAnswerTest, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: (__VLS_ctx.config.title),
    questions: (__VLS_ctx.config.questions),
}));
const __VLS_2 = __VLS_1({
    title: (__VLS_ctx.config.title),
    questions: (__VLS_ctx.config.questions),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
var __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
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
