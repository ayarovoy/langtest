import { onMounted, ref } from 'vue';
import suiteConfig from '../data/synthetic-suite.json';
const items = suiteConfig;
const storageKey = 'langtest:demo:test-suite-state';
const suiteRef = ref();
const isReadyToPersist = ref(false);
const loadInitialState = () => {
    if (typeof window === 'undefined')
        return undefined;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw)
        return undefined;
    try {
        return JSON.parse(raw);
    }
    catch {
        return undefined;
    }
};
const initialState = ref(loadInitialState());
onMounted(() => {
    isReadyToPersist.value = true;
});
const onStateChange = (state) => {
    if (typeof window === 'undefined' || !isReadyToPersist.value)
        return;
    window.localStorage.setItem(storageKey, JSON.stringify(state));
};
const clearPersistedState = () => {
    if (typeof window === 'undefined')
        return;
    window.localStorage.removeItem(storageKey);
    initialState.value = undefined;
    suiteRef.value?.setState(undefined);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "demo-suite" },
});
const __VLS_0 = {}.TestSuiteContainer;
/** @type {[typeof __VLS_components.TestSuiteContainer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onStateChange': {} },
    ref: "suiteRef",
    items: (__VLS_ctx.items),
    initialState: (__VLS_ctx.initialState),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onStateChange': {} },
    ref: "suiteRef",
    items: (__VLS_ctx.items),
    initialState: (__VLS_ctx.initialState),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onStateChange: (__VLS_ctx.onStateChange)
};
/** @type {typeof __VLS_ctx.suiteRef} */ ;
var __VLS_8 = {};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "demo-suite__actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearPersistedState) },
    type: "button",
    ...{ class: "demo-suite__button" },
});
/** @type {__VLS_StyleScopedClasses['demo-suite']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-suite__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['demo-suite__button']} */ ;
// @ts-ignore
var __VLS_9 = __VLS_8;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            items: items,
            suiteRef: suiteRef,
            initialState: initialState,
            onStateChange: onStateChange,
            clearPersistedState: clearPersistedState,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
