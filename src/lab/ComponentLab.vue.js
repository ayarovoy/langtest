import { computed, ref } from 'vue';
import { componentRegistry } from './componentRegistry';
const selectedId = ref(componentRegistry[0]?.id ?? '');
const selectedEntry = computed(() => componentRegistry.find((entry) => entry.id === selectedId.value) ?? componentRegistry[0]);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lab" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "lab__sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "lab__title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "lab__subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "lab__list" },
});
for (const [entry] of __VLS_getVForSourceType((__VLS_ctx.componentRegistry))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
        key: (entry.id),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedId = entry.id;
            } },
        ...{ class: "lab__item-btn" },
        ...{ class: ({ 'lab__item-btn--active': entry.id === __VLS_ctx.selectedId }) },
        type: "button",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "lab__item-title" },
    });
    (entry.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "lab__item-desc" },
    });
    (entry.description);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "lab__preview" },
});
const __VLS_0 = ((__VLS_ctx.selectedEntry.component));
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['lab']} */ ;
/** @type {__VLS_StyleScopedClasses['lab__sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['lab__title']} */ ;
/** @type {__VLS_StyleScopedClasses['lab__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['lab__list']} */ ;
/** @type {__VLS_StyleScopedClasses['lab__item-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['lab__item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['lab__item-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['lab__preview']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            componentRegistry: componentRegistry,
            selectedId: selectedId,
            selectedEntry: selectedEntry,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
