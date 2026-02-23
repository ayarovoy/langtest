import { testComponentMap } from './test-component-map';
const __VLS_props = defineProps();
const getComponent = (type) => testComponentMap[type];
const getComponentProps = (item) => {
    if (item.componentType === 'choose-correct-answer') {
        return { title: item.title, descriptionMarkdown: item.descriptionMarkdown, questions: item.questions };
    }
    if (item.componentType === 'fill-in-the-blank') {
        return { title: item.title, descriptionMarkdown: item.descriptionMarkdown, texts: item.texts };
    }
    if (item.componentType === 'yes-no-questions') {
        return { title: item.title, descriptionMarkdown: item.descriptionMarkdown, tasks: item.tasks };
    }
    return { title: item.title, descriptionMarkdown: item.descriptionMarkdown, tasks: item.tasks };
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "suite" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.id),
        ...{ class: "suite__item" },
    });
    const __VLS_0 = ((__VLS_ctx.getComponent(item.componentType)));
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...(__VLS_ctx.getComponentProps(item)),
    }));
    const __VLS_2 = __VLS_1({
        ...(__VLS_ctx.getComponentProps(item)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
/** @type {__VLS_StyleScopedClasses['suite']} */ ;
/** @type {__VLS_StyleScopedClasses['suite__item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getComponent: getComponent,
            getComponentProps: getComponentProps,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
