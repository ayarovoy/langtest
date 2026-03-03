import { ref } from 'vue';
import SuiteJsonEditor from '../components/SuiteJsonEditor.vue';
import TestSuiteContainer from '../components/TestSuiteContainer.vue';
import suiteConfig from '../data/synthetic-suite.json';
const items = ref(suiteConfig);
const editorRef = ref();
const previewDialogVisible = ref(false);
const onPreview = () => {
    previewDialogVisible.value = true;
};
const onExport = () => {
    const json = editorRef.value?.getJson();
    if (!json)
        return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suite-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['suite-editor-demo__dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-editor-demo__dialog']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "suite-editor-demo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suite-editor-demo__actions" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.onPreview)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "success",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.onExport)
};
__VLS_11.slots.default;
var __VLS_11;
/** @type {[typeof SuiteJsonEditor, ]} */ ;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent(SuiteJsonEditor, new SuiteJsonEditor({
    ref: "editorRef",
    modelValue: (__VLS_ctx.items),
}));
const __VLS_17 = __VLS_16({
    ref: "editorRef",
    modelValue: (__VLS_ctx.items),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
/** @type {typeof __VLS_ctx.editorRef} */ ;
var __VLS_19 = {};
var __VLS_18;
const __VLS_21 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    modelValue: (__VLS_ctx.previewDialogVisible),
    title: "Предпросмотр",
    width: "90%",
    draggable: true,
    overflow: true,
    destroyOnClose: true,
    ...{ class: "suite-editor-demo__dialog" },
}));
const __VLS_23 = __VLS_22({
    modelValue: (__VLS_ctx.previewDialogVisible),
    title: "Предпросмотр",
    width: "90%",
    draggable: true,
    overflow: true,
    destroyOnClose: true,
    ...{ class: "suite-editor-demo__dialog" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
if (__VLS_ctx.items.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suite-editor-demo__empty" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suite-editor-demo__preview-wrapper" },
    });
    /** @type {[typeof TestSuiteContainer, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(TestSuiteContainer, new TestSuiteContainer({
        items: (__VLS_ctx.items),
    }));
    const __VLS_26 = __VLS_25({
        items: (__VLS_ctx.items),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
var __VLS_24;
/** @type {__VLS_StyleScopedClasses['suite-editor-demo']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-editor-demo__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-editor-demo__dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-editor-demo__empty']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-editor-demo__preview-wrapper']} */ ;
// @ts-ignore
var __VLS_20 = __VLS_19;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            SuiteJsonEditor: SuiteJsonEditor,
            TestSuiteContainer: TestSuiteContainer,
            items: items,
            editorRef: editorRef,
            previewDialogVisible: previewDialogVisible,
            onPreview: onPreview,
            onExport: onExport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
