import { computed, ref } from 'vue';
import { renderMarkdown } from '../utils/markdown';
const props = defineProps();
const emit = defineEmits();
const mode = ref('text');
const renderedMarkdown = computed(() => renderMarkdown(props.modelValue ?? ''));
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['markdown-editor__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__preview']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "markdown-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "markdown-editor__toolbar" },
});
const __VLS_0 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.mode),
    size: "small",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.mode),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    value: "text",
}));
const __VLS_6 = __VLS_5({
    value: "text",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
const __VLS_8 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    value: "wysiwyg",
}));
const __VLS_10 = __VLS_9({
    value: "wysiwyg",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
var __VLS_11;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "markdown-editor__panes" },
    ...{ class: ({ 'markdown-editor__panes--split': __VLS_ctx.mode === 'wysiwyg' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    ...{ onInput: (...[$event]) => {
            __VLS_ctx.emit('update:modelValue', $event.target.value);
        } },
    value: (__VLS_ctx.modelValue),
    ...{ class: "markdown-editor__textarea" },
    placeholder: (__VLS_ctx.placeholder),
    spellcheck: "false",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ...{ class: "markdown-editor__preview" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.mode === 'wysiwyg') }, null, null);
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedMarkdown) }, null, null);
/** @type {__VLS_StyleScopedClasses['markdown-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__panes']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-editor__preview']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            emit: emit,
            mode: mode,
            renderedMarkdown: renderedMarkdown,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
