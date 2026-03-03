import { computed, reactive, ref, watch } from 'vue';
import { renderMarkdown } from '../utils/markdown';
const props = withDefaults(defineProps(), { title: 'Ответьте ДА или НЕТ', showProgress: true });
const emit = defineEmits();
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
const totalTasksCount = computed(() => props.tasks.length);
const isTaskCompleted = (taskId) => {
    const task = props.tasks.find((item) => item.id === taskId);
    if (!task)
        return false;
    return task.questions.every((question) => getSelectedAnswer(taskId, question.id) !== undefined);
};
const isTaskCorrect = (taskId) => {
    const task = props.tasks.find((item) => item.id === taskId);
    if (!task)
        return false;
    return task.questions.every((question) => isQuestionCorrect(taskId, question.id));
};
const completedTasksCount = computed(() => props.tasks.reduce((acc, task) => (isTaskCompleted(task.id) ? acc + 1 : acc), 0));
const progressPercent = computed(() => {
    if (totalTasksCount.value === 0)
        return 0;
    return Math.round((completedTasksCount.value / totalTasksCount.value) * 100);
});
const checkedTasksCount = computed(() => (checkMode.value ? totalTasksCount.value : 0));
const correctCheckedTasksCount = computed(() => {
    if (!checkMode.value)
        return 0;
    return props.tasks.reduce((acc, task) => (isTaskCorrect(task.id) ? acc + 1 : acc), 0);
});
watch([completedTasksCount, totalTasksCount, correctCheckedTasksCount, checkedTasksCount], ([completed, total, correctChecked, checked]) => {
    emit('progress-change', { completed, total, correctChecked, checked });
}, { immediate: true });
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
    const classes = [];
    if (selected === optionValue)
        classes.push('yn-test__answer-btn--selected');
    if (showAnswersMode.value && question.correctAnswer === optionValue) {
        classes.push('yn-test__answer-btn--correct-answer');
    }
    return classes.join(' ');
};
const toBoolean = (value) => value === true;
const normalizeState = (state) => {
    const raw = (state ?? {});
    const validKeys = new Set(props.tasks.flatMap((task) => task.questions.map((question) => keyOf(task.id, question.id))));
    const selectedAnswers = {};
    const rawSelected = raw.selectedAnswers ?? {};
    Object.entries(rawSelected).forEach(([answerKey, answerValue]) => {
        if (!validKeys.has(answerKey) || typeof answerValue !== 'boolean')
            return;
        selectedAnswers[answerKey] = answerValue;
    });
    return {
        selectedAnswers,
        checkMode: toBoolean(raw.checkMode),
        showAnswersMode: toBoolean(raw.showAnswersMode),
    };
};
const applyState = (state) => {
    const normalized = normalizeState(state);
    Object.keys(selectedAnswers).forEach((key) => delete selectedAnswers[key]);
    Object.entries(normalized.selectedAnswers).forEach(([answerKey, answerValue]) => {
        selectedAnswers[answerKey] = answerValue;
    });
    checkMode.value = normalized.checkMode;
    showAnswersMode.value = normalized.showAnswersMode;
};
const getState = () => normalizeState({
    selectedAnswers,
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
watch(() => props.tasks, () => {
    applyState(getState());
}, { deep: true });
watch([selectedAnswers, checkMode, showAnswersMode], () => {
    emit('state-change', getState());
}, { immediate: true, deep: true });
let __VLS_exposed;
defineExpose({ getState, setState });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({ title: 'Ответьте ДА или НЕТ', showProgress: true });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__text']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__text']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__text']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__text']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__text']} */ ;
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
if (__VLS_ctx.showProgress) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yn-test__progress" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yn-test__progress-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "yn-test__progress-label" },
    });
    (__VLS_ctx.completedTasksCount);
    (__VLS_ctx.totalTasksCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "yn-test__progress-stats" },
    });
    (__VLS_ctx.correctCheckedTasksCount);
    (__VLS_ctx.checkedTasksCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yn-test__progress-track" },
        role: "progressbar",
        'aria-valuemin': (0),
        'aria-valuemax': (__VLS_ctx.totalTasksCount),
        'aria-valuenow': (__VLS_ctx.completedTasksCount),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "yn-test__progress-fill" },
        ...{ style: ({ width: `${__VLS_ctx.progressPercent}%` }) },
    });
}
for (const [task] of __VLS_getVForSourceType((__VLS_ctx.tasks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (task.id),
        ...{ class: "yn-test__task" },
    });
    if (__VLS_ctx.isTaskCompleted(task.id)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "yn-test__completed-mark" },
            'aria-hidden': "true",
        });
    }
    if (task.title) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (task.title);
    }
    if (task.textMarkdown) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "yn-test__text" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(task.textMarkdown)) }, null, null);
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
/** @type {__VLS_StyleScopedClasses['yn-test__progress']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__progress-head']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__progress-label']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__progress-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__progress-track']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__task']} */ ;
/** @type {__VLS_StyleScopedClasses['yn-test__completed-mark']} */ ;
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
            renderMarkdown: renderMarkdown,
            renderedDescription: renderedDescription,
            selectAnswer: selectAnswer,
            totalTasksCount: totalTasksCount,
            isTaskCompleted: isTaskCompleted,
            completedTasksCount: completedTasksCount,
            progressPercent: progressPercent,
            checkedTasksCount: checkedTasksCount,
            correctCheckedTasksCount: correctCheckedTasksCount,
            checkAnswers: checkAnswers,
            showAnswers: showAnswers,
            resetFeedback: resetFeedback,
            restartTest: restartTest,
            getQuestionStateClass: getQuestionStateClass,
            getAnswerButtonClass: getAnswerButtonClass,
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
