import { ref, watch } from 'vue';
import MarkdownEditor from '../MarkdownEditor.vue';
const props = defineProps();
const emit = defineEmits();
const descriptionMarkdown = ref(props.modelValue.descriptionMarkdown ?? '');
const restJson = ref('');
const restJsonError = ref('');
const restJsonFromItem = (item) => {
    const { title, descriptionMarkdown: _desc, ...rest } = item;
    void _desc;
    void title;
    return JSON.stringify(rest, null, 2);
};
const syncFromProp = () => {
    descriptionMarkdown.value = props.modelValue.descriptionMarkdown ?? '';
    restJson.value = restJsonFromItem(props.modelValue);
    restJsonError.value = '';
};
watch(() => props.modelValue, syncFromProp, { immediate: true, deep: true });
const onDescriptionChange = (v) => {
    descriptionMarkdown.value = v;
    emit('update:modelValue', { ...props.modelValue, descriptionMarkdown: v || undefined });
};
const tryParseRest = () => {
    const raw = restJson.value.trim();
    if (!raw)
        return null;
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'id' in parsed && 'componentType' in parsed) {
            return parsed;
        }
    }
    catch {
        // ignore
    }
    return null;
};
const emitUpdate = () => {
    const parsed = tryParseRest();
    if (parsed) {
        restJsonError.value = '';
        const full = {
            ...parsed,
            title: props.modelValue.title,
            descriptionMarkdown: descriptionMarkdown.value || undefined,
        };
        emit('update:modelValue', full);
    }
    else if (restJson.value.trim()) {
        try {
            JSON.parse(restJson.value);
        }
        catch (e) {
            restJsonError.value = e instanceof Error ? e.message : 'Невалидный JSON';
        }
    }
    else {
        restJsonError.value = '';
        const base = { ...props.modelValue, descriptionMarkdown: descriptionMarkdown.value || undefined };
        emit('update:modelValue', base);
    }
};
const onRestJsonInput = () => {
    const parsed = tryParseRest();
    restJsonError.value = parsed ? '' : (restJson.value.trim() ? 'Невалидный JSON' : '');
};
const onRestJsonBlur = () => {
    const parsed = tryParseRest();
    if (parsed) {
        restJsonError.value = '';
        emitUpdate();
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "choose-correct-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "choose-correct-editor__section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "choose-correct-editor__section-title" },
});
/** @type {[typeof MarkdownEditor, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(MarkdownEditor, new MarkdownEditor({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.descriptionMarkdown),
    placeholder: "Инструкция для задания...",
}));
const __VLS_1 = __VLS_0({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.descriptionMarkdown),
    placeholder: "Инструкция для задания...",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    'onUpdate:modelValue': (__VLS_ctx.onDescriptionChange)
};
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "choose-correct-editor__section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
    ...{ class: "choose-correct-editor__section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    ...{ onInput: (__VLS_ctx.onRestJsonInput) },
    ...{ onBlur: (__VLS_ctx.onRestJsonBlur) },
    value: (__VLS_ctx.restJson),
    ...{ class: "choose-correct-editor__textarea" },
    ...{ class: ({ 'choose-correct-editor__textarea--error': __VLS_ctx.restJsonError }) },
    spellcheck: "false",
    placeholder: '{ "answerLayout": "auto", "questions": [...] }',
});
if (__VLS_ctx.restJsonError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "choose-correct-editor__error" },
    });
    (__VLS_ctx.restJsonError);
}
/** @type {__VLS_StyleScopedClasses['choose-correct-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-correct-editor__section']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-correct-editor__section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-correct-editor__section']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-correct-editor__section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-correct-editor__textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['choose-correct-editor__error']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MarkdownEditor: MarkdownEditor,
            descriptionMarkdown: descriptionMarkdown,
            restJson: restJson,
            restJsonError: restJsonError,
            onDescriptionChange: onDescriptionChange,
            onRestJsonInput: onRestJsonInput,
            onRestJsonBlur: onRestJsonBlur,
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
