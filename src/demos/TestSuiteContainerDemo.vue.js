import TestSuiteContainer from '../components/TestSuiteContainer.vue';
import suiteConfig from '../data/synthetic-suite.json';
const items = suiteConfig;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {[typeof TestSuiteContainer, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(TestSuiteContainer, new TestSuiteContainer({
    items: (__VLS_ctx.items),
}));
const __VLS_1 = __VLS_0({
    items: (__VLS_ctx.items),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
var __VLS_2;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            TestSuiteContainer: TestSuiteContainer,
            items: items,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
