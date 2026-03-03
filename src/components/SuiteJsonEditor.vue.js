import { computed, reactive, ref, watch } from 'vue';
import ChooseCorrectAnswerEditor from './editors/ChooseCorrectAnswerEditor.vue';
const componentTypes = [
    'choose-correct-answer',
    'fill-in-the-blank',
    'match-pairs',
    'yes-no-questions',
];
const props = defineProps();
const emit = defineEmits();
const MAX_HISTORY = 50;
const items = ref([]);
const historyUndo = ref([]);
const historyRedo = ref([]);
const isUndoRedoInProgress = ref(false);
const activeNames = ref([]);
const newComponentType = ref('');
const localJsonByKey = reactive({});
const jsonErrorByKey = reactive({});
const titleDraftByKey = reactive({});
const canUndo = computed(() => historyUndo.value.length > 0);
const canRedo = computed(() => historyRedo.value.length > 0);
const snapshot = () => JSON.parse(JSON.stringify(items.value));
const snapshotsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const pushUndo = () => {
    if (isUndoRedoInProgress.value)
        return;
    const state = snapshot();
    historyUndo.value.push(state);
    if (historyUndo.value.length > MAX_HISTORY)
        historyUndo.value.shift();
    historyRedo.value = [];
};
const genId = () => `comp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const stubs = {
    'choose-correct-answer': () => ({
        id: genId(),
        componentType: 'choose-correct-answer',
        title: '',
        questions: [],
    }),
    'fill-in-the-blank': () => ({
        id: genId(),
        componentType: 'fill-in-the-blank',
        title: '',
        texts: [],
    }),
    'match-pairs': () => ({
        id: genId(),
        componentType: 'match-pairs',
        title: '',
        tasks: [],
    }),
    'yes-no-questions': () => ({
        id: genId(),
        componentType: 'yes-no-questions',
        title: '',
        tasks: [],
    }),
};
const formatComponentTypeLabel = (t) => {
    const labels = {
        'choose-correct-answer': 'Выбери правильный ответ',
        'fill-in-the-blank': 'Заполни пропуск',
        'match-pairs': 'Сопоставь пары',
        'yes-no-questions': 'Вопросы ДА/НЕТ',
    };
    return labels[t] ?? t;
};
const syncItemsFromProp = () => {
    const incoming = props.modelValue;
    const nextItems = Array.isArray(incoming) && incoming.length > 0
        ? JSON.parse(JSON.stringify(incoming))
        : [];
    const isExternalChange = !snapshotsEqual(items.value, nextItems);
    items.value = nextItems;
    if (isExternalChange) {
        historyUndo.value = [];
        historyRedo.value = [];
    }
    syncLocalJsonFromItems();
};
const itemJsonWithoutTitle = (item) => {
    const obj = { ...item };
    delete obj.title;
    return JSON.stringify(obj, null, 2);
};
const syncLocalJsonFromItems = () => {
    const ids = new Set(items.value.map((i) => i.id));
    for (const id of Object.keys(localJsonByKey)) {
        if (!ids.has(id)) {
            delete localJsonByKey[id];
            delete jsonErrorByKey[id];
            delete titleDraftByKey[id];
        }
    }
    for (const item of items.value) {
        if (item.componentType !== 'choose-correct-answer') {
            localJsonByKey[item.id] = itemJsonWithoutTitle(item);
        }
        delete jsonErrorByKey[item.id];
    }
};
watch(() => props.modelValue, () => syncItemsFromProp(), { immediate: true });
const emitItems = () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(items.value)));
};
const undo = () => {
    if (historyUndo.value.length === 0)
        return;
    isUndoRedoInProgress.value = true;
    historyRedo.value.push(snapshot());
    const prev = historyUndo.value.pop();
    items.value = prev;
    syncLocalJsonFromItems();
    emitItems();
    isUndoRedoInProgress.value = false;
};
const redo = () => {
    if (historyRedo.value.length === 0)
        return;
    isUndoRedoInProgress.value = true;
    historyUndo.value.push(snapshot());
    const next = historyRedo.value.pop();
    items.value = next;
    syncLocalJsonFromItems();
    emitItems();
    isUndoRedoInProgress.value = false;
};
const tryParseItem = (id, raw) => {
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'id' in parsed && 'componentType' in parsed) {
            return parsed;
        }
        return null;
    }
    catch {
        return null;
    }
};
const onTitleInput = (id, value) => {
    titleDraftByKey[id] = value;
};
const onChooseCorrectAnswerUpdate = (index, payload) => {
    if (!snapshotsEqual([items.value[index]], [payload])) {
        pushUndo();
    }
    items.value[index] = payload;
    emitItems();
};
const onTitleBlur = (id, value) => {
    const idx = items.value.findIndex((i) => i.id === id);
    if (idx < 0)
        return;
    const currentTitle = items.value[idx].title ?? '';
    const newTitle = value.trim();
    delete titleDraftByKey[id];
    if (newTitle !== currentTitle) {
        pushUndo();
        items.value[idx] = { ...items.value[idx], title: newTitle || undefined };
        localJsonByKey[id] = itemJsonWithoutTitle(items.value[idx]);
        emitItems();
    }
};
const onBlur = (id) => {
    const raw = localJsonByKey[id];
    if (!raw?.trim())
        return;
    const parsed = tryParseItem(id, raw);
    if (parsed) {
        const idx = items.value.findIndex((i) => i.id === id);
        if (idx >= 0) {
            parsed.title = items.value[idx].title;
            if (!snapshotsEqual([items.value[idx]], [parsed])) {
                pushUndo();
            }
            const oldId = id;
            items.value[idx] = parsed;
            delete jsonErrorByKey[oldId];
            if (parsed.id !== oldId) {
                delete localJsonByKey[oldId];
            }
            localJsonByKey[parsed.id] = itemJsonWithoutTitle(parsed);
            emitItems();
        }
    }
    else {
        try {
            JSON.parse(raw);
        }
        catch (e) {
            jsonErrorByKey[id] = e instanceof Error ? e.message : 'Невалидный JSON';
        }
    }
};
const onInput = (id) => {
    const raw = localJsonByKey[id];
    const parsed = tryParseItem(id, raw);
    if (parsed) {
        delete jsonErrorByKey[id];
    }
    else if (raw?.trim()) {
        try {
            JSON.parse(raw);
        }
        catch {
            jsonErrorByKey[id] = 'Невалидный JSON';
        }
    }
    else {
        delete jsonErrorByKey[id];
    }
};
const addComponent = () => {
    const type = newComponentType.value;
    if (!type || !componentTypes.includes(type))
        return;
    pushUndo();
    const stub = stubs[type]();
    items.value.push(stub);
    localJsonByKey[stub.id] = itemJsonWithoutTitle(stub);
    activeNames.value = [...(activeNames.value || []), stub.id];
    emitItems();
};
const removeComponent = (index) => {
    pushUndo();
    const removed = items.value[index];
    items.value.splice(index, 1);
    delete localJsonByKey[removed.id];
    delete jsonErrorByKey[removed.id];
    activeNames.value = activeNames.value.filter((n) => n !== removed.id);
    emitItems();
};
const moveUp = (index) => {
    if (index <= 0)
        return;
    pushUndo();
    const arr = items.value;
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    emitItems();
};
const moveDown = (index) => {
    if (index >= items.value.length - 1)
        return;
    pushUndo();
    const arr = items.value;
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    emitItems();
};
const getJson = () => {
    return JSON.stringify(items.value, null, 2);
};
const __VLS_exposed = { getJson };
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__title-input']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__title-input']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__title-input']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suite-json-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suite-json-editor__toolbar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suite-json-editor__undo-redo" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    size: "small",
    disabled: (!__VLS_ctx.canUndo),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    size: "small",
    disabled: (!__VLS_ctx.canUndo),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.undo)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    size: "small",
    disabled: (!__VLS_ctx.canRedo),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    size: "small",
    disabled: (!__VLS_ctx.canRedo),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.redo)
};
__VLS_11.slots.default;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "suite-json-editor__label" },
});
const __VLS_16 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.newComponentType),
    placeholder: "Выберите тип",
    size: "default",
    ...{ class: "suite-json-editor__select" },
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.newComponentType),
    placeholder: "Выберите тип",
    size: "default",
    ...{ class: "suite-json-editor__select" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
for (const [t] of __VLS_getVForSourceType((__VLS_ctx.componentTypes))) {
    const __VLS_20 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        key: (t),
        label: (__VLS_ctx.formatComponentTypeLabel(t)),
        value: (t),
    }));
    const __VLS_22 = __VLS_21({
        key: (t),
        label: (__VLS_ctx.formatComponentTypeLabel(t)),
        value: (t),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
var __VLS_19;
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.newComponentType),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.newComponentType),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.addComponent)
};
__VLS_27.slots.default;
var __VLS_27;
const __VLS_32 = {}.ElCollapse;
/** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.activeNames),
    ...{ class: "suite-json-editor__collapse" },
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.activeNames),
    ...{ class: "suite-json-editor__collapse" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    const __VLS_36 = {}.ElCollapseItem;
    /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        key: (item.id),
        name: (item.id),
    }));
    const __VLS_38 = __VLS_37({
        key: (item.id),
        name: (item.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    {
        const { title: __VLS_thisSlot } = __VLS_39.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "suite-json-editor__header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onInput: (...[$event]) => {
                    __VLS_ctx.onTitleInput(item.id, $event.target.value);
                } },
            ...{ onBlur: (...[$event]) => {
                    __VLS_ctx.onTitleBlur(item.id, $event.target.value);
                } },
            ...{ onClick: () => { } },
            value: (__VLS_ctx.titleDraftByKey[item.id] ?? item.title ?? ''),
            ...{ class: "suite-json-editor__title-input" },
            placeholder: (`${__VLS_ctx.formatComponentTypeLabel(item.componentType)} • ${item.id}`),
            title: "Нажмите для редактирования",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "suite-json-editor__actions" },
        });
        const __VLS_40 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (index === 0),
        }));
        const __VLS_42 = __VLS_41({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (index === 0),
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        let __VLS_44;
        let __VLS_45;
        let __VLS_46;
        const __VLS_47 = {
            onClick: (...[$event]) => {
                __VLS_ctx.moveUp(index);
            }
        };
        __VLS_43.slots.default;
        var __VLS_43;
        const __VLS_48 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (index === __VLS_ctx.items.length - 1),
        }));
        const __VLS_50 = __VLS_49({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (index === __VLS_ctx.items.length - 1),
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        let __VLS_52;
        let __VLS_53;
        let __VLS_54;
        const __VLS_55 = {
            onClick: (...[$event]) => {
                __VLS_ctx.moveDown(index);
            }
        };
        __VLS_51.slots.default;
        var __VLS_51;
        const __VLS_56 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_60;
        let __VLS_61;
        let __VLS_62;
        const __VLS_63 = {
            onClick: (...[$event]) => {
                __VLS_ctx.removeComponent(index);
            }
        };
        __VLS_59.slots.default;
        var __VLS_59;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "suite-json-editor__body" },
    });
    if (item.componentType === 'choose-correct-answer') {
        /** @type {[typeof ChooseCorrectAnswerEditor, ]} */ ;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(ChooseCorrectAnswerEditor, new ChooseCorrectAnswerEditor({
            ...{ 'onUpdate:modelValue': {} },
            modelValue: (item),
        }));
        const __VLS_65 = __VLS_64({
            ...{ 'onUpdate:modelValue': {} },
            modelValue: (item),
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        let __VLS_67;
        let __VLS_68;
        let __VLS_69;
        const __VLS_70 = {
            'onUpdate:modelValue': (...[$event]) => {
                if (!(item.componentType === 'choose-correct-answer'))
                    return;
                __VLS_ctx.onChooseCorrectAnswerUpdate(index, $event);
            }
        };
        var __VLS_66;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
            ...{ onBlur: (...[$event]) => {
                    if (!!(item.componentType === 'choose-correct-answer'))
                        return;
                    __VLS_ctx.onBlur(item.id);
                } },
            ...{ onInput: (...[$event]) => {
                    if (!!(item.componentType === 'choose-correct-answer'))
                        return;
                    __VLS_ctx.onInput(item.id);
                } },
            value: (__VLS_ctx.localJsonByKey[item.id]),
            ...{ class: "suite-json-editor__textarea" },
            ...{ class: ({ 'suite-json-editor__textarea--error': __VLS_ctx.jsonErrorByKey[item.id] }) },
            spellcheck: "false",
        });
        if (__VLS_ctx.jsonErrorByKey[item.id]) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "suite-json-editor__error" },
            });
            (__VLS_ctx.jsonErrorByKey[item.id]);
        }
    }
    var __VLS_39;
}
var __VLS_35;
if (__VLS_ctx.items.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "suite-json-editor__empty" },
    });
}
/** @type {__VLS_StyleScopedClasses['suite-json-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__undo-redo']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__label']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__select']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__collapse']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__header']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__title-input']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__body']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__error']} */ ;
/** @type {__VLS_StyleScopedClasses['suite-json-editor__empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChooseCorrectAnswerEditor: ChooseCorrectAnswerEditor,
            componentTypes: componentTypes,
            items: items,
            activeNames: activeNames,
            newComponentType: newComponentType,
            localJsonByKey: localJsonByKey,
            jsonErrorByKey: jsonErrorByKey,
            titleDraftByKey: titleDraftByKey,
            canUndo: canUndo,
            canRedo: canRedo,
            formatComponentTypeLabel: formatComponentTypeLabel,
            undo: undo,
            redo: redo,
            onTitleInput: onTitleInput,
            onChooseCorrectAnswerUpdate: onChooseCorrectAnswerUpdate,
            onTitleBlur: onTitleBlur,
            onBlur: onBlur,
            onInput: onInput,
            addComponent: addComponent,
            removeComponent: removeComponent,
            moveUp: moveUp,
            moveDown: moveDown,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
