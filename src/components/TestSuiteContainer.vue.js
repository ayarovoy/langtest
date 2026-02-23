import { computed, reactive, watch } from 'vue';
import { testComponentMap } from './test-component-map';
const props = defineProps();
const emit = defineEmits();
const progressByItemId = reactive({});
const stateByItemId = reactive({});
const itemHandles = reactive({});
const initialStateAppliedByItemId = reactive({});
const itemRefSetters = {};
const getComponent = (type) => testComponentMap[type];
const getItemTotal = (item) => {
    if (item.componentType === 'choose-correct-answer')
        return item.questions.length;
    if (item.componentType === 'fill-in-the-blank')
        return item.texts.length;
    return item.tasks.length;
};
const getFallbackProgress = (item) => ({
    completed: 0,
    total: getItemTotal(item),
    correctChecked: 0,
    checked: 0,
});
const onItemProgressChange = (itemId, payload) => {
    progressByItemId[itemId] = payload;
};
const createEmptyStateForItem = (item) => {
    if (item.componentType === 'choose-correct-answer') {
        const state = {
            selectedAnswers: {},
            checkMode: false,
            showAnswersMode: false,
        };
        return state;
    }
    if (item.componentType === 'fill-in-the-blank') {
        const state = {
            userAnswers: {},
            checkMode: false,
            showAnswersMode: false,
        };
        return state;
    }
    if (item.componentType === 'match-pairs') {
        const state = {
            assignments: {},
            checkMode: false,
            showAnswersMode: false,
        };
        return state;
    }
    const state = {
        selectedAnswers: {},
        checkMode: false,
        showAnswersMode: false,
    };
    return state;
};
const createFallbackStateEnvelope = (item) => ({
    componentType: item.componentType,
    state: createEmptyStateForItem(item),
});
const getInitialStateEnvelope = (item) => {
    const incoming = props.initialState?.items?.[item.id];
    if (!incoming || incoming.componentType !== item.componentType)
        return createFallbackStateEnvelope(item);
    return incoming;
};
const onItemStateChange = (itemId, componentType, state) => {
    stateByItemId[itemId] = {
        componentType,
        state,
    };
};
const setItemRef = (itemId, element) => {
    if (!element) {
        itemHandles[itemId] = undefined;
        return;
    }
    const handle = element;
    itemHandles[itemId] = handle;
    const item = props.items.find((entry) => entry.id === itemId);
    const initialEnvelope = props.initialState?.items?.[itemId];
    if (item &&
        initialEnvelope &&
        initialEnvelope.componentType === item.componentType &&
        !initialStateAppliedByItemId[itemId]) {
        handle.setState(initialEnvelope.state);
        initialStateAppliedByItemId[itemId] = true;
    }
};
const makeItemRefSetter = (itemId) => {
    if (!itemRefSetters[itemId]) {
        itemRefSetters[itemId] = (element) => {
            setItemRef(itemId, element);
        };
    }
    return itemRefSetters[itemId];
};
watch(() => props.items, (items) => {
    const activeIds = new Set(items.map((item) => item.id));
    Object.keys(progressByItemId).forEach((id) => {
        if (!activeIds.has(id))
            delete progressByItemId[id];
    });
    Object.keys(stateByItemId).forEach((id) => {
        if (!activeIds.has(id))
            delete stateByItemId[id];
    });
    Object.keys(itemHandles).forEach((id) => {
        if (!activeIds.has(id))
            delete itemHandles[id];
    });
    Object.keys(initialStateAppliedByItemId).forEach((id) => {
        if (!activeIds.has(id))
            delete initialStateAppliedByItemId[id];
    });
    Object.keys(itemRefSetters).forEach((id) => {
        if (!activeIds.has(id))
            delete itemRefSetters[id];
    });
    items.forEach((item) => {
        if (!progressByItemId[item.id]) {
            progressByItemId[item.id] = getFallbackProgress(item);
        }
        if (!stateByItemId[item.id]) {
            stateByItemId[item.id] = getInitialStateEnvelope(item);
        }
    });
}, { immediate: true });
watch(() => props.initialState, (nextState) => {
    if (!nextState)
        return;
    props.items.forEach((item) => {
        const nextItemState = nextState.items[item.id];
        const handle = itemHandles[item.id];
        if (!nextItemState || !handle || nextItemState.componentType !== item.componentType)
            return;
        handle.setState(nextItemState.state);
    });
}, { deep: true });
const totalItemsCount = computed(() => props.items.reduce((acc, item) => acc + (progressByItemId[item.id] ?? getFallbackProgress(item)).total, 0));
const completedItemsCount = computed(() => props.items.reduce((acc, item) => acc + (progressByItemId[item.id] ?? getFallbackProgress(item)).completed, 0));
const checkedItemsCount = computed(() => props.items.reduce((acc, item) => acc + (progressByItemId[item.id] ?? getFallbackProgress(item)).checked, 0));
const correctCheckedItemsCount = computed(() => props.items.reduce((acc, item) => acc + (progressByItemId[item.id] ?? getFallbackProgress(item)).correctChecked, 0));
const progressPercent = computed(() => {
    if (totalItemsCount.value === 0)
        return 0;
    return Math.round((completedItemsCount.value / totalItemsCount.value) * 100);
});
const getState = () => ({
    items: Object.fromEntries(props.items.map((item) => {
        const fallbackEnvelope = createFallbackStateEnvelope(item);
        const handle = itemHandles[item.id];
        const currentState = handle?.getState() ?? stateByItemId[item.id]?.state ?? fallbackEnvelope.state;
        return [
            item.id,
            {
                componentType: item.componentType,
                state: currentState,
            },
        ];
    })),
});
const setState = (state) => {
    const rawState = (state ?? {});
    props.items.forEach((item) => {
        const nextEnvelope = rawState.items?.[item.id];
        const nextState = nextEnvelope && nextEnvelope.componentType === item.componentType
            ? nextEnvelope.state
            : createFallbackStateEnvelope(item).state;
        itemHandles[item.id]?.setState(nextState);
    });
};
watch([stateByItemId, () => props.items], () => {
    emit('state-change', getState());
}, { immediate: true, deep: true });
let __VLS_exposed;
defineExpose({ getState, setState });
const getComponentProps = (item) => {
    if (item.componentType === 'choose-correct-answer') {
        return {
            title: item.title,
            descriptionMarkdown: item.descriptionMarkdown,
            showProgress: false,
            answerLayout: item.answerLayout,
            answerLayoutHeuristics: item.answerLayoutHeuristics,
            questions: item.questions,
        };
    }
    if (item.componentType === 'fill-in-the-blank') {
        return {
            title: item.title,
            descriptionMarkdown: item.descriptionMarkdown,
            showProgress: false,
            texts: item.texts,
        };
    }
    if (item.componentType === 'yes-no-questions') {
        return {
            title: item.title,
            descriptionMarkdown: item.descriptionMarkdown,
            showProgress: false,
            tasks: item.tasks,
        };
    }
    return {
        title: item.title,
        descriptionMarkdown: item.descriptionMarkdown,
        showProgress: false,
        tasks: item.tasks,
    };
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suite__progress" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suite__progress-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "suite__progress-label" },
});
(__VLS_ctx.completedItemsCount);
(__VLS_ctx.totalItemsCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "suite__progress-stats" },
});
(__VLS_ctx.correctCheckedItemsCount);
(__VLS_ctx.checkedItemsCount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suite__progress-track" },
    role: "progressbar",
    'aria-valuemin': (0),
    'aria-valuemax': (__VLS_ctx.totalItemsCount),
    'aria-valuenow': (__VLS_ctx.completedItemsCount),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suite__progress-fill" },
    ...{ style: ({ width: `${__VLS_ctx.progressPercent}%` }) },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.items))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.id),
        ...{ class: "suite__item" },
    });
    const __VLS_0 = ((__VLS_ctx.getComponent(item.componentType)));
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onProgressChange': {} },
        ...{ 'onStateChange': {} },
        ref: (__VLS_ctx.makeItemRefSetter(item.id)),
        ...(__VLS_ctx.getComponentProps(item)),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onProgressChange': {} },
        ...{ 'onStateChange': {} },
        ref: (__VLS_ctx.makeItemRefSetter(item.id)),
        ...(__VLS_ctx.getComponentProps(item)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onProgressChange: (...[$event]) => {
            __VLS_ctx.onItemProgressChange(item.id, $event);
        }
    };
    const __VLS_8 = {
        onStateChange: (...[$event]) => {
            __VLS_ctx.onItemStateChange(item.id, item.componentType, $event);
        }
    };
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['suite']} */ ;
/** @type {__VLS_StyleScopedClasses['suite__progress']} */ ;
/** @type {__VLS_StyleScopedClasses['suite__progress-head']} */ ;
/** @type {__VLS_StyleScopedClasses['suite__progress-label']} */ ;
/** @type {__VLS_StyleScopedClasses['suite__progress-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['suite__progress-track']} */ ;
/** @type {__VLS_StyleScopedClasses['suite__progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['suite__item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            getComponent: getComponent,
            onItemProgressChange: onItemProgressChange,
            onItemStateChange: onItemStateChange,
            makeItemRefSetter: makeItemRefSetter,
            totalItemsCount: totalItemsCount,
            completedItemsCount: completedItemsCount,
            checkedItemsCount: checkedItemsCount,
            correctCheckedItemsCount: correctCheckedItemsCount,
            progressPercent: progressPercent,
            getComponentProps: getComponentProps,
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
