import { computed, reactive, ref } from 'vue';
import { renderMarkdown } from '../utils/markdown';
const props = withDefaults(defineProps(), { title: 'Ответьте ДА или НЕТ' });
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''));
const selectedAnswers = reactive({});
const checkMode = ref(false);
const showAnswersMode = ref(false);
const keyOf = (taskId, questionId) => `${taskId}::${questionId}`;
const getSelectedAnswer = (taskId, questionId) => selectedAnswers[keyOf(taskId, questionId)];
const findQuestion = (taskId, questionId) => props.tasks.find((task) => task.id === taskId)?.questions.find((question) => question.id === questionId);
const isQuestionCorrect = (taskId, questionId) => {
    const question = findQuestion(taskId, questionId);
    if (!question)
        return false;
    return getSelectedAnswer(taskId, questionId) === question.correctAnswer;
};
const selectAnswer = (taskId, questionId, answer) => {
    checkMode.value = false;
    showAnswersMode.value = false;
    selectedAnswers[keyOf(taskId, questionId)] = answer;
};
const totalQuestionsCount = computed(() => props.tasks.reduce((acc, task) => acc + task.questions.length, 0));
const correctQuestionsCount = computed(() => props.tasks.reduce((acc, task) => acc + task.questions.reduce((taskAcc, question) => (isQuestionCorrect(task.id, question.id) ? taskAcc + 1 : taskAcc), 0), 0));
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
const getQuestionStateClass = (taskId, questionId) => {
    const hasAnswer = getSelectedAnswer(taskId, questionId) !== undefined;
    if (showAnswersMode.value)
        return 'yn-test__question--correct';
    if (!checkMode.value)
        return '';
    if (!hasAnswer)
        return 'yn-test__question--incorrect';
    return isQuestionCorrect(taskId, questionId) ? 'yn-test__question--correct' : 'yn-test__question--incorrect';
};
const getAnswerButtonClass = (taskId, questionId, optionValue) => {
    const selected = getSelectedAnswer(taskId, questionId);
    const question = findQuestion(taskId, questionId);
    if (!question)
        return '';
    if (showAnswersMode.value) {
        if (question.correctAnswer === optionValue)
            return 'yn-test__answer-btn--correct-answer';
        if (selected === optionValue && selected !== question.correctAnswer) {
            return 'yn-test__answer-btn--incorrect-answer';
        }
        return '';
    }
    if (selected === optionValue)
        return 'yn-test__answer-btn--selected';
    return '';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({ title: 'Ответьте ДА или НЕТ' });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__question']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__question-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "yn-test" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.title);
if (__VLS_ctx.descriptionMarkdown) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yn-test__description" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedDescription) }, null, null);
}
if (__VLS_ctx.checkMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "yn-test__stats" },
    });
    (__VLS_ctx.correctQuestionsCount);
    (__VLS_ctx.totalQuestionsCount);
}
for (const [task] of __VLS_getVForSourceType((__VLS_ctx.tasks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (task.id),
        ...{ class: "yn-test__task" },
    });
    if (task.title) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (task.title);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yn-test__texts" },
    });
    for (const [textItem, textIndex] of __VLS_getVForSourceType((task.texts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            key: (`${task.id}-text-${textIndex}`),
            ...{ class: "yn-test__text" },
        });
        (textItem);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "yn-test__questions" },
    });
    for (const [question] of __VLS_getVForSourceType((task.questions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (question.id),
            ...{ class: "yn-test__question" },
            ...{ class: (__VLS_ctx.getQuestionStateClass(task.id, question.id)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "yn-test__question-text" },
        });
        (question.text);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "yn-test__question-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.selectAnswer(task.id, question.id, true);
                } },
            type: "button",
            ...{ class: "yn-test__answer-btn" },
            ...{ class: (__VLS_ctx.getAnswerButtonClass(task.id, question.id, true)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.selectAnswer(task.id, question.id, false);
                } },
            type: "button",
            ...{ class: "yn-test__answer-btn" },
            ...{ class: (__VLS_ctx.getAnswerButtonClass(task.id, question.id, false)) },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "yn-test__actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.checkAnswers) },
    ...{ class: "yn-test__check-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.showAnswers) },
    ...{ class: "yn-test__secondary-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetFeedback) },
    ...{ class: "yn-test__secondary-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.restartTest) },
    ...{ class: "yn-test__secondary-btn" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['yn-test']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__stats']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__task']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__texts']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__text']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__questions']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__question']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__question-text']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__question-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__answer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__answer-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__check-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__secondary-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            renderedDescription: renderedDescription,
            checkMode: checkMode,
            selectAnswer: selectAnswer,
            totalQuestionsCount: totalQuestionsCount,
            correctQuestionsCount: correctQuestionsCount,
            checkAnswers: checkAnswers,
            showAnswers: showAnswers,
            resetFeedback: resetFeedback,
            restartTest: restartTest,
            getQuestionStateClass: getQuestionStateClass,
            getAnswerButtonClass: getAnswerButtonClass,
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
