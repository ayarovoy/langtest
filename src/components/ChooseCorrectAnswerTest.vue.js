import { computed, reactive, ref } from 'vue';
import { renderMarkdown } from '../utils/markdown';
const props = withDefaults(defineProps(), { title: 'Выбери правильный ответ' });
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''));
const selectedAnswers = reactive({});
const checkMode = ref(false);
const showAnswersMode = ref(false);
const isSelected = (questionId, optionId) => (selectedAnswers[questionId] ?? []).includes(optionId);
const isCorrectOption = (questionId, optionId) => props.questions.find((q) => q.id === questionId)?.correctOptionIds.includes(optionId) ?? false;
const toggleSelection = (question, optionId) => {
    checkMode.value = false;
    showAnswersMode.value = false;
    if (!selectedAnswers[question.id])
        selectedAnswers[question.id] = [];
    if (question.multiple) {
        const idx = selectedAnswers[question.id].indexOf(optionId);
        if (idx >= 0)
            selectedAnswers[question.id].splice(idx, 1);
        else
            selectedAnswers[question.id].push(optionId);
        return;
    }
    selectedAnswers[question.id] = [optionId];
};
const isQuestionCorrect = (question) => {
    const selected = [...(selectedAnswers[question.id] ?? [])].sort();
    const correct = [...question.correctOptionIds].sort();
    return selected.length === correct.length && selected.every((id, i) => id === correct[i]);
};
const totalQuestions = computed(() => props.questions.length);
const correctQuestionsCount = computed(() => props.questions.reduce((acc, q) => (isQuestionCorrect(q) ? acc + 1 : acc), 0));
const checkAnswers = () => {
    checkMode.value = true;
};
const showAnswers = () => {
    showAnswersMode.value = true;
};
const resetFeedback = () => {
    checkMode.value = false;
    showAnswersMode.value = false;
};
const restartTest = () => {
    resetFeedback();
    Object.keys(selectedAnswers).forEach((k) => delete selectedAnswers[k]);
};
const getAnswerStateClass = (questionId, optionId) => {
    const question = props.questions.find((q) => q.id === questionId);
    if (!question)
        return '';
    if (showAnswersMode.value) {
        if (question.correctOptionIds.includes(optionId))
            return 'test__answer--correct';
        return isSelected(questionId, optionId) ? 'test__answer--incorrect' : '';
    }
    if (!checkMode.value || !isSelected(questionId, optionId))
        return '';
    return question.correctOptionIds.includes(optionId) ? 'test__answer--correct' : 'test__answer--incorrect';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({ title: 'Выбери правильный ответ' });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['test__answer']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "test" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "test__title" },
});
(__VLS_ctx.title);
if (__VLS_ctx.descriptionMarkdown) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "test__description" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedDescription) }, null, null);
}
if (__VLS_ctx.checkMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "test__stats" },
    });
    (__VLS_ctx.correctQuestionsCount);
    (__VLS_ctx.totalQuestions);
}
for (const [question] of __VLS_getVForSourceType((__VLS_ctx.questions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (question.id),
        ...{ class: "test__question" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "test__question-text" },
    });
    (question.text);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "test__answers" },
    });
    for (const [option] of __VLS_getVForSourceType((question.options))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (option.id),
            ...{ class: "test__answer" },
            ...{ class: (__VLS_ctx.getAnswerStateClass(question.id, option.id)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onChange: (...[$event]) => {
                    __VLS_ctx.toggleSelection(question, option.id);
                } },
            type: (question.multiple ? 'checkbox' : 'radio'),
            name: (question.id),
            checked: (__VLS_ctx.isSelected(question.id, option.id)),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "test__answer-text" },
        });
        (option.text);
        if (__VLS_ctx.showAnswersMode && __VLS_ctx.isCorrectOption(question.id, option.id)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "test__correct-icon" },
            });
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "test__actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.checkAnswers) },
    ...{ class: "test__check-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.showAnswers) },
    ...{ class: "test__secondary-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetFeedback) },
    ...{ class: "test__secondary-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.restartTest) },
    ...{ class: "test__secondary-btn" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['test']} */ ;
/** @type {__VLS_StyleScopedClasses['test__title']} */ ;
/** @type {__VLS_StyleScopedClasses['test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['test__stats']} */ ;
/** @type {__VLS_StyleScopedClasses['test__question']} */ ;
/** @type {__VLS_StyleScopedClasses['test__question-text']} */ ;
/** @type {__VLS_StyleScopedClasses['test__answers']} */ ;
/** @type {__VLS_StyleScopedClasses['test__answer']} */ ;
/** @type {__VLS_StyleScopedClasses['test__answer-text']} */ ;
/** @type {__VLS_StyleScopedClasses['test__correct-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['test__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['test__check-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['test__secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['test__secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['test__secondary-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            renderedDescription: renderedDescription,
            checkMode: checkMode,
            showAnswersMode: showAnswersMode,
            isSelected: isSelected,
            isCorrectOption: isCorrectOption,
            toggleSelection: toggleSelection,
            totalQuestions: totalQuestions,
            correctQuestionsCount: correctQuestionsCount,
            checkAnswers: checkAnswers,
            showAnswers: showAnswers,
            resetFeedback: resetFeedback,
            restartTest: restartTest,
            getAnswerStateClass: getAnswerStateClass,
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
