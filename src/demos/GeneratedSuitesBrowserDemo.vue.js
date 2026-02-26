import { onMounted, ref } from 'vue';
const suiteList = ref([]);
const selectedFileName = ref('');
const loadedItems = ref([]);
const initialState = ref(undefined);
const suiteRenderKey = ref('suite-render:empty');
const isLoadingList = ref(false);
const isLoadingSuite = ref(false);
const listError = ref('');
const suiteError = ref('');
const storagePrefix = 'langtest:generated-suite-state:';
const makeStorageKey = (fileName) => `${storagePrefix}${fileName}`;
const loadPersistedState = (fileName) => {
    if (typeof window === 'undefined' || !fileName)
        return undefined;
    const raw = window.localStorage.getItem(makeStorageKey(fileName));
    if (!raw)
        return undefined;
    try {
        return JSON.parse(raw);
    }
    catch {
        return undefined;
    }
};
const onStateChange = (state) => {
    if (typeof window === 'undefined' || !selectedFileName.value)
        return;
    window.localStorage.setItem(makeStorageKey(selectedFileName.value), JSON.stringify(state));
};
const loadList = async () => {
    isLoadingList.value = true;
    listError.value = '';
    try {
        const response = await fetch('/api/generated-suites');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json());
        suiteList.value = payload;
        if (!selectedFileName.value && payload.length > 0) {
            selectedFileName.value = payload[0].fileName;
        }
    }
    catch (error) {
        listError.value = `Не удалось загрузить список наборов: ${String(error)}`;
    }
    finally {
        isLoadingList.value = false;
    }
};
const loadSelectedSuite = async () => {
    if (!selectedFileName.value)
        return;
    isLoadingSuite.value = true;
    suiteError.value = '';
    try {
        const response = await fetch(`/api/generated-suites/${encodeURIComponent(selectedFileName.value)}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json());
        loadedItems.value = payload;
        initialState.value = loadPersistedState(selectedFileName.value);
        suiteRenderKey.value = `suite-render:${selectedFileName.value}:${Date.now()}`;
    }
    catch (error) {
        suiteError.value = `Не удалось загрузить набор ${selectedFileName.value}: ${String(error)}`;
        loadedItems.value = [];
        initialState.value = undefined;
    }
    finally {
        isLoadingSuite.value = false;
    }
};
const clearPersistedStateForSelectedSuite = () => {
    if (typeof window === 'undefined' || !selectedFileName.value)
        return;
    window.localStorage.removeItem(makeStorageKey(selectedFileName.value));
    initialState.value = undefined;
    if (loadedItems.value.length > 0) {
        suiteRenderKey.value = `suite-render:${selectedFileName.value}:${Date.now()}`;
    }
};
onMounted(async () => {
    await loadList();
    if (selectedFileName.value) {
        await loadSelectedSuite();
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "generated-suites" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "generated-suites__header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "generated-suites__title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "generated-suites__subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "generated-suites__controls" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "generated-suites__label" },
    for: "suite-select",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    id: "suite-select",
    value: (__VLS_ctx.selectedFileName),
    ...{ class: "generated-suites__select" },
    disabled: (__VLS_ctx.isLoadingList || __VLS_ctx.suiteList.length === 0),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
    disabled: true,
});
for (const [entry] of __VLS_getVForSourceType((__VLS_ctx.suiteList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (entry.fileName),
        value: (entry.fileName),
    });
    (entry.fileName);
    (entry.componentCount);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.loadList) },
    type: "button",
    ...{ class: "generated-suites__btn" },
    disabled: (__VLS_ctx.isLoadingList),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.loadSelectedSuite) },
    type: "button",
    ...{ class: "generated-suites__btn generated-suites__btn--primary" },
    disabled: (!__VLS_ctx.selectedFileName || __VLS_ctx.isLoadingSuite),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.clearPersistedStateForSelectedSuite) },
    type: "button",
    ...{ class: "generated-suites__btn" },
    disabled: (!__VLS_ctx.selectedFileName),
});
if (__VLS_ctx.listError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "generated-suites__error" },
    });
    (__VLS_ctx.listError);
}
if (__VLS_ctx.suiteError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "generated-suites__error" },
    });
    (__VLS_ctx.suiteError);
}
if (__VLS_ctx.isLoadingSuite) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "generated-suites__hint" },
    });
}
if (__VLS_ctx.loadedItems.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "generated-suites__suite" },
    });
    const __VLS_0 = {}.TestSuiteContainer;
    /** @type {[typeof __VLS_components.TestSuiteContainer, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onStateChange': {} },
        key: (__VLS_ctx.suiteRenderKey),
        items: (__VLS_ctx.loadedItems),
        initialState: (__VLS_ctx.initialState),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onStateChange': {} },
        key: (__VLS_ctx.suiteRenderKey),
        items: (__VLS_ctx.loadedItems),
        initialState: (__VLS_ctx.initialState),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onStateChange: (__VLS_ctx.onStateChange)
    };
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['generated-suites']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__header']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__title']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__controls']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__label']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__select']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__btn--primary']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__error']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__error']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__hint']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-suites__suite']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            suiteList: suiteList,
            selectedFileName: selectedFileName,
            loadedItems: loadedItems,
            initialState: initialState,
            suiteRenderKey: suiteRenderKey,
            isLoadingList: isLoadingList,
            isLoadingSuite: isLoadingSuite,
            listError: listError,
            suiteError: suiteError,
            onStateChange: onStateChange,
            loadList: loadList,
            loadSelectedSuite: loadSelectedSuite,
            clearPersistedStateForSelectedSuite: clearPersistedStateForSelectedSuite,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
