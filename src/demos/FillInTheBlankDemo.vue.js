import importedTasks from '../data/synthetic-fill-in-the-blank.json';
const config = importedTasks;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.FillInTheBlankTest;
/** @type {[typeof __VLS_components.FillInTheBlankTest, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: (__VLS_ctx.config.title),
    texts: (__VLS_ctx.config.texts),
}));
const __VLS_2 = __VLS_1({
    title: (__VLS_ctx.config.title),
    texts: (__VLS_ctx.config.texts),
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
