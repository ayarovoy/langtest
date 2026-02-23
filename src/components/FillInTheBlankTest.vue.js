import { computed, reactive, ref } from 'vue';
import AnswerCommentPopover from './AnswerCommentPopover.vue';
import { renderMarkdown } from '../utils/markdown';
const props = withDefaults(defineProps(), { title: 'Заполни пропуск' });
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
const totalBlanksCount = computed(() => props.texts.reduce((acc, t) => acc + t.blanks.length, 0));
const correctBlanksCount = computed(() => props.texts.reduce((acc, t) => acc + t.blanks.reduce((bAcc, b) => (isBlankCorrect(t.id, b.id) ? bAcc + 1 : bAcc), 0), 0));
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({ title: 'Заполни пропуск' });
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
if (__VLS_ctx.checkMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "fill-test__stats" },
    });
    (__VLS_ctx.correctBlanksCount);
    (__VLS_ctx.totalBlanksCount);
}
for (const [textItem] of __VLS_getVForSourceType((__VLS_ctx.texts))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (textItem.id),
        ...{ class: "fill-test__card" },
    });
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
/** @type {__VLS_StyleScopedClasses['fill-test__stats']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-test__card']} */ ;
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
            checkMode: checkMode,
            showAnswersMode: showAnswersMode,
            openCommentKey: openCommentKey,
            keyOf: keyOf,
            getUserAnswer: getUserAnswer,
            getBlankComment: getBlankComment,
            getDisplayedAnswer: getDisplayedAnswer,
            totalBlanksCount: totalBlanksCount,
            correctBlanksCount: correctBlanksCount,
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
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
