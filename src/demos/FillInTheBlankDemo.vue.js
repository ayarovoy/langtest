import FillInTheBlankTest from '../components/FillInTheBlankTest.vue';
import importedTasks from '../data/synthetic-fill-in-the-blank.json';
const tasks = importedTasks;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {[typeof FillInTheBlankTest, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(FillInTheBlankTest, new FillInTheBlankTest({
    title: "Демо: заполни пропуск",
    texts: (__VLS_ctx.tasks),
}));
const __VLS_1 = __VLS_0({
    title: "Демо: заполни пропуск",
    texts: (__VLS_ctx.tasks),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
var __VLS_2;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            FillInTheBlankTest: FillInTheBlankTest,
            tasks: tasks,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
