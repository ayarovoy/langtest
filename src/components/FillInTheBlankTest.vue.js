import { computed, reactive, ref, watch } from 'vue';
import AnswerCommentPopover from './AnswerCommentPopover.vue';
import { renderMarkdown } from '../utils/markdown';
const props = withDefaults(defineProps(), { title: 'Заполни пропуск', showProgress: true });
const emit = defineEmits();
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''));
const userAnswers = reactive({});
const checkMode = ref(false);
const showAnswersMode = ref(false);
const openCommentKey = ref('');
const keyOf = (textId, blankId) => `${textId}::${blankId}`;
const normalize = (value) => value.trim().toLowerCase();
const findBlank = (textId, blankId) => props.texts.find((t) => t.id === textId)?.blanks.find((b) => b.id === blankId);
const getUserAnswer = (textId, blankId) => userAnswers[keyOf(textId, blankId)] ?? '';
const getBlankComment = (textId, blankId) => findBlank(textId, blankId)?.commentMarkdown ?? '';
const getCorrectAnswersText = (textId, blankId) => findBlank(textId, blankId)?.correctAnswers.join(' / ') ?? '';
const getDisplayedAnswer = (textId, blankId) => showAnswersMode.value ? getCorrectAnswersText(textId, blankId) : getUserAnswer(textId, blankId);
const isBlankCorrect = (textId, blankId) => {
    const blank = findBlank(textId, blankId);
    if (!blank)
        return false;
    const userValue = normalize(getUserAnswer(textId, blankId));
    return blank.correctAnswers.some((a) => normalize(a) === userValue);
};
const totalTextsCount = computed(() => props.texts.length);
const isTextCompleted = (textId) => {
    const text = props.texts.find((item) => item.id === textId);
    if (!text)
        return false;
    return text.blanks.every((blank) => getUserAnswer(textId, blank.id).trim().length > 0);
};
const isTextCorrect = (textId) => {
    const text = props.texts.find((item) => item.id === textId);
    if (!text)
        return false;
    return text.blanks.every((blank) => isBlankCorrect(textId, blank.id));
};
const completedTextsCount = computed(() => props.texts.reduce((acc, text) => (isTextCompleted(text.id) ? acc + 1 : acc), 0));
const progressPercent = computed(() => {
    if (totalTextsCount.value === 0)
        return 0;
    return Math.round((completedTextsCount.value / totalTextsCount.value) * 100);
});
const checkedTextsCount = computed(() => (checkMode.value ? totalTextsCount.value : 0));
const correctCheckedTextsCount = computed(() => {
    if (!checkMode.value)
        return 0;
    return props.texts.reduce((acc, text) => (isTextCorrect(text.id) ? acc + 1 : acc), 0);
});
watch([completedTextsCount, totalTextsCount, correctCheckedTextsCount, checkedTextsCount], ([completed, total, correctChecked, checked]) => {
    emit('progress-change', { completed, total, correctChecked, checked });
}, { immediate: true });
const parseContent = (content) => {
    const parts = content.split(/(\[\[[\w-]+\]\])/g);
    const segments = [];
    for (const part of parts) {
        if (!part)
            continue;
        const m = part.match(/^\[\[([\w-]+)\]\]$/);
        if (m)
            segments.push({ type: 'blank', blankId: m[1] });
        else
            segments.push({ type: 'text', value: part });
    }
    return segments;
};
const segmentsByTextId = computed(() => Object.fromEntries(props.texts.map((item) => [item.id, parseContent(item.content)])));
const getSegments = (textId) => segmentsByTextId.value[textId] ?? [];
const onInputChange = (textId, blankId, event) => {
    checkMode.value = false;
    showAnswersMode.value = false;
    openCommentKey.value = '';
    userAnswers[keyOf(textId, blankId)] = event.target.value;
};
const hasIncorrectUserAnswer = (textId, blankId) => {
    const answer = getUserAnswer(textId, blankId).trim();
    return answer.length > 0 && !isBlankCorrect(textId, blankId);
};
const toggleComment = (textId, blankId) => {
    const key = keyOf(textId, blankId);
    openCommentKey.value = openCommentKey.value === key ? '' : key;
};
const checkAnswers = () => { checkMode.value = true; };
const showAnswers = () => {
    showAnswersMode.value = true;
    openCommentKey.value = '';
};
const resetFeedback = () => {
    checkMode.value = false;
    showAnswersMode.value = false;
    openCommentKey.value = '';
};
const restartTest = () => {
    resetFeedback();
    Object.keys(userAnswers).forEach((k) => delete userAnswers[k]);
};
const getBlankStateClass = (textId, blankId) => {
    if (!checkMode.value)
        return '';
    return isBlankCorrect(textId, blankId) ? 'fill-test__blank--correct' : 'fill-test__blank--incorrect';
};
const toBoolean = (value) => value === true;
const normalizeState = (state) => {
    const raw = (state ?? {});
    const validKeys = new Set(props.texts.flatMap((text) => text.blanks.map((blank) => keyOf(text.id, blank.id))));
    const userAnswers = {};
    const rawAnswers = raw.userAnswers ?? {};
    Object.entries(rawAnswers).forEach(([blankKey, value]) => {
        if (!validKeys.has(blankKey) || typeof value !== 'string')
            return;
        userAnswers[blankKey] = value;
    });
    return {
        userAnswers,
        checkMode: toBoolean(raw.checkMode),
        showAnswersMode: toBoolean(raw.showAnswersMode),
    };
};
const applyState = (state) => {
    const normalized = normalizeState(state);
    Object.keys(userAnswers).forEach((key) => delete userAnswers[key]);
    Object.entries(normalized.userAnswers).forEach(([blankKey, value]) => {
        userAnswers[blankKey] = value;
    });
    checkMode.value = normalized.checkMode;
    showAnswersMode.value = normalized.showAnswersMode;
    openCommentKey.value = '';
};
const getState = () => normalizeState({
    userAnswers,
    checkMode: checkMode.value,
    showAnswersMode: showAnswersMode.value,
});
const setState = (state) => {
    applyState(state);
};
watch(() => props.initialState, (state) => {
    if (!state)
        return;
    applyState(state);
}, { immediate: true, deep: true });
watch(() => props.texts, () => {
    applyState(getState());
}, { deep: true });
watch([userAnswers, checkMode, showAnswersMode], () => {
    emit('state-change', getState());
}, { immediate: true, deep: true });
let __VLS_exposed;
defineExpose({ getState, setState });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({ title: 'Заполни пропуск', showProgress: true });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['fill-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__input']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "fill-test" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.title);
if (__VLS_ctx.descriptionMarkdown) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fill-test__description" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedDescription) }, null, null);
}
if (__VLS_ctx.showProgress) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fill-test__progress" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fill-test__progress-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "fill-test__progress-label" },
    });
    (__VLS_ctx.completedTextsCount);
    (__VLS_ctx.totalTextsCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "fill-test__progress-stats" },
    });
    (__VLS_ctx.correctCheckedTextsCount);
    (__VLS_ctx.checkedTextsCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fill-test__progress-track" },
        role: "progressbar",
        'aria-valuemin': (0),
        'aria-valuemax': (__VLS_ctx.totalTextsCount),
        'aria-valuenow': (__VLS_ctx.completedTextsCount),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fill-test__progress-fill" },
        ...{ style: ({ width: `${__VLS_ctx.progressPercent}%` }) },
    });
}
for (const [textItem] of __VLS_getVForSourceType((__VLS_ctx.texts))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (textItem.id),
        ...{ class: "fill-test__card" },
    });
    if (__VLS_ctx.isTextCompleted(textItem.id)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "fill-test__completed-mark" },
            'aria-hidden': "true",
        });
    }
    if (textItem.title) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (textItem.title);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "fill-test__text" },
    });
    for (const [segment, index] of __VLS_getVForSourceType((__VLS_ctx.getSegments(textItem.id)))) {
        (`${textItem.id}-${index}`);
        if (segment.type === 'text') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (segment.value);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "fill-test__blank" },
                ...{ class: (__VLS_ctx.getBlankStateClass(textItem.id, segment.blankId)) },
            });
            if (__VLS_ctx.showAnswersMode && __VLS_ctx.hasIncorrectUserAnswer(textItem.id, segment.blankId)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "fill-test__wrong-answer" },
                });
                (__VLS_ctx.getUserAnswer(textItem.id, segment.blankId));
            }
            if (__VLS_ctx.showAnswersMode) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "fill-test__answer" },
                    title: (__VLS_ctx.getDisplayedAnswer(textItem.id, segment.blankId)),
                });
                (__VLS_ctx.getDisplayedAnswer(textItem.id, segment.blankId));
            }
            else {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
                    ...{ onInput: (...[$event]) => {
                            if (!!(segment.type === 'text'))
                                return;
                            if (!!(__VLS_ctx.showAnswersMode))
                                return;
                            __VLS_ctx.onInputChange(textItem.id, segment.blankId, $event);
                        } },
                    ...{ class: "fill-test__input" },
                    value: (__VLS_ctx.getDisplayedAnswer(textItem.id, segment.blankId)),
                    title: (__VLS_ctx.getDisplayedAnswer(textItem.id, segment.blankId)),
                    type: "text",
                });
            }
            if (__VLS_ctx.showAnswersMode && __VLS_ctx.getBlankComment(textItem.id, segment.blankId)) {
                /** @type {[typeof AnswerCommentPopover, ]} */ ;
                // @ts-ignore
                const __VLS_0 = __VLS_asFunctionalComponent(AnswerCommentPopover, new AnswerCommentPopover({
                    ...{ 'onToggle': {} },
                    markdown: (__VLS_ctx.getBlankComment(textItem.id, segment.blankId)),
                    isOpen: (__VLS_ctx.openCommentKey === __VLS_ctx.keyOf(textItem.id, segment.blankId)),
                }));
                const __VLS_1 = __VLS_0({
                    ...{ 'onToggle': {} },
                    markdown: (__VLS_ctx.getBlankComment(textItem.id, segment.blankId)),
                    isOpen: (__VLS_ctx.openCommentKey === __VLS_ctx.keyOf(textItem.id, segment.blankId)),
                }, ...__VLS_functionalComponentArgsRest(__VLS_0));
                let __VLS_3;
                let __VLS_4;
                let __VLS_5;
                const __VLS_6 = {
                    onToggle: (...[$event]) => {
                        if (!!(segment.type === 'text'))
                            return;
                        if (!(__VLS_ctx.showAnswersMode && __VLS_ctx.getBlankComment(textItem.id, segment.blankId)))
                            return;
                        __VLS_ctx.toggleComment(textItem.id, segment.blankId);
                    }
                };
                var __VLS_2;
            }
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "fill-test__actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.checkAnswers) },
    ...{ class: "fill-test__check-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.showAnswers) },
    ...{ class: "fill-test__secondary-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetFeedback) },
    ...{ class: "fill-test__secondary-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.restartTest) },
    ...{ class: "fill-test__secondary-btn" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['fill-test']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__progress']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__progress-head']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__progress-label']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__progress-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__progress-track']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__card']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__completed-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__text']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__blank']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__wrong-answer']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__answer']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__input']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__check-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__secondary-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AnswerCommentPopover: AnswerCommentPopover,
            renderedDescription: renderedDescription,
            showAnswersMode: showAnswersMode,
            openCommentKey: openCommentKey,
            keyOf: keyOf,
            getUserAnswer: getUserAnswer,
            getBlankComment: getBlankComment,
            getDisplayedAnswer: getDisplayedAnswer,
            totalTextsCount: totalTextsCount,
            isTextCompleted: isTextCompleted,
            completedTextsCount: completedTextsCount,
            progressPercent: progressPercent,
            checkedTextsCount: checkedTextsCount,
            correctCheckedTextsCount: correctCheckedTextsCount,
            getSegments: getSegments,
            onInputChange: onInputChange,
            hasIncorrectUserAnswer: hasIncorrectUserAnswer,
            toggleComment: toggleComment,
            checkAnswers: checkAnswers,
            showAnswers: showAnswers,
            resetFeedback: resetFeedback,
            restartTest: restartTest,
            getBlankStateClass: getBlankStateClass,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
