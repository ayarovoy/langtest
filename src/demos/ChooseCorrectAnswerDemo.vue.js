import { computed, ref } from 'vue';
import importedQuestions from '../data/synthetic-questions.json';
const config = importedQuestions;
const fallbackLayoutModes = [
    { id: 'vertical', title: 'Вертикальная' },
    { id: 'horizontal', title: 'Горизонтальная' },
    { id: 'auto', title: 'Авто' },
];
const layoutModes = computed(() => config.demoLayoutModes && config.demoLayoutModes.length > 0
    ? config.demoLayoutModes
    : fallbackLayoutModes);
const selectedLayout = ref(config.answerLayout ?? 'auto');
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "choose-demo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "choose-demo__layout-switcher" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "choose-demo__layout-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "choose-demo__layout-buttons" },
});
for (const [mode] of __VLS_getVForSourceType((__VLS_ctx.layoutModes))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedLayout = mode.id;
            } },
        key: (mode.id),
        type: "button",
        ...{ class: "choose-demo__layout-btn" },
        ...{ class: ({ 'choose-demo__layout-btn--active': __VLS_ctx.selectedLayout === mode.id }) },
    });
    (mode.title);
}
const __VLS_0 = {}.ChooseCorrectAnswerTest;
/** @type {[typeof __VLS_components.ChooseCorrectAnswerTest, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    title: (__VLS_ctx.config.title),
    descriptionMarkdown: (__VLS_ctx.config.descriptionMarkdown),
    questions: (__VLS_ctx.config.questions),
    answerLayout: (__VLS_ctx.selectedLayout),
    answerLayoutHeuristics: (__VLS_ctx.config.answerLayoutHeuristics),
}));
const __VLS_2 = __VLS_1({
    title: (__VLS_ctx.config.title),
    descriptionMarkdown: (__VLS_ctx.config.descriptionMarkdown),
    questions: (__VLS_ctx.config.questions),
    answerLayout: (__VLS_ctx.selectedLayout),
    answerLayoutHeuristics: (__VLS_ctx.config.answerLayoutHeuristics),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['choose-demo']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-demo__layout-switcher']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-demo__layout-label']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-demo__layout-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-demo__layout-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            config: config,
            layoutModes: layoutModes,
            selectedLayout: selectedLayout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
