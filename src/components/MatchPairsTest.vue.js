import { computed, reactive, ref } from 'vue';
import AnswerCommentPopover from './AnswerCommentPopover.vue';
import { renderMarkdown } from '../utils/markdown';
const props = withDefaults(defineProps(), { title: 'Сопоставь одно с другим' });
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''));
const assignments = reactive({});
const pendingOptionByTask = reactive({});
const draggingTaskId = ref('');
const draggingOptionId = ref('');
const checkMode = ref(false);
const showAnswersMode = ref(false);
const openCommentKey = ref('');
const makeKey = (taskId, rowId) => `${taskId}::${rowId}`;
const findTask = (taskId) => props.tasks.find((t) => t.id === taskId);
const findRow = (taskId, rowId) => findTask(taskId)?.rows.find((r) => r.id === rowId);
const findOption = (taskId, optionId) => findTask(taskId)?.options.find((o) => o.id === optionId);
const getPendingOption = (taskId) => pendingOptionByTask[taskId] ?? '';
const getAvailableOptions = (taskId) => {
    const task = findTask(taskId);
    if (!task)
        return [];
    const assigned = new Set(task.rows.map((r) => assignments[makeKey(taskId, r.id)]).filter(Boolean));
    return task.options.filter((o) => !assigned.has(o.id));
};
const assignOptionToRow = (taskId, rowId, optionId) => {
    checkMode.value = false;
    showAnswersMode.value = false;
    openCommentKey.value = '';
    const task = findTask(taskId);
    if (!task)
        return;
    task.rows.forEach((row) => {
        if (assignments[makeKey(taskId, row.id)] === optionId)
            delete assignments[makeKey(taskId, row.id)];
    });
    assignments[makeKey(taskId, rowId)] = optionId;
    pendingOptionByTask[taskId] = '';
};
const onAnswerClick = (taskId, optionId) => {
    pendingOptionByTask[taskId] = pendingOptionByTask[taskId] === optionId ? '' : optionId;
};
const onDropzoneClick = (taskId, rowId) => {
    const optionId = getPendingOption(taskId);
    if (optionId)
        assignOptionToRow(taskId, rowId, optionId);
};
const onAnswerDragStart = (taskId, optionId, event) => {
    draggingTaskId.value = taskId;
    draggingOptionId.value = optionId;
    event.dataTransfer?.setData('text/plain', `${taskId}::${optionId}`);
};
const onRowDrop = (taskId, rowId, event) => {
    const payload = event.dataTransfer?.getData('text/plain') ?? '';
    const [payloadTaskId, payloadOptionId] = payload.split('::');
    const sourceTaskId = payloadTaskId || draggingTaskId.value;
    const optionId = payloadOptionId || draggingOptionId.value;
    if (sourceTaskId === taskId && optionId)
        assignOptionToRow(taskId, rowId, optionId);
};
const onAnswerTouchStart = (taskId, optionId) => {
    draggingTaskId.value = taskId;
    draggingOptionId.value = optionId;
};
const onAnswerTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    if (!touch)
        return;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropzone = target?.closest('.match-test__dropzone');
    if (!dropzone)
        return;
    const taskId = dropzone.dataset.taskId ?? '';
    const rowId = dropzone.dataset.rowId ?? '';
    if (taskId && rowId && taskId === draggingTaskId.value)
        assignOptionToRow(taskId, rowId, draggingOptionId.value);
};
const isRowCorrect = (taskId, rowId) => {
    const row = findRow(taskId, rowId);
    return !!row && assignments[makeKey(taskId, rowId)] === row.correctOptionId;
};
const hasWrongAssignment = (taskId, rowId) => Boolean(assignments[makeKey(taskId, rowId)]) && !isRowCorrect(taskId, rowId);
const getAssignedText = (taskId, rowId) => {
    const assigned = assignments[makeKey(taskId, rowId)];
    return assigned ? findOption(taskId, assigned)?.text ?? '' : '';
};
const getCorrectText = (taskId, rowId) => {
    const row = findRow(taskId, rowId);
    if (!row)
        return 'Перетащите ответ сюда';
    return findOption(taskId, row.correctOptionId)?.text ?? 'Перетащите ответ сюда';
};
const getDisplayedText = (taskId, rowId) => {
    if (showAnswersMode.value)
        return getCorrectText(taskId, rowId);
    return getAssignedText(taskId, rowId) || 'Перетащите ответ сюда';
};
const isPlaceholder = (taskId, rowId) => !showAnswersMode.value && !getAssignedText(taskId, rowId);
const getDropzoneClass = (taskId, rowId) => {
    if (showAnswersMode.value)
        return 'match-test__dropzone--correct';
    if (!checkMode.value)
        return '';
    if (!assignments[makeKey(taskId, rowId)])
        return 'match-test__dropzone--incorrect';
    return isRowCorrect(taskId, rowId) ? 'match-test__dropzone--correct' : 'match-test__dropzone--incorrect';
};
const totalRowsCount = computed(() => props.tasks.reduce((acc, t) => acc + t.rows.length, 0));
const correctRowsCount = computed(() => props.tasks.reduce((acc, t) => acc + t.rows.reduce((rAcc, r) => (isRowCorrect(t.id, r.id) ? rAcc + 1 : rAcc), 0), 0));
const checkAnswers = () => { checkMode.value = true; };
const toggleComment = (taskId, rowId) => {
    const key = makeKey(taskId, rowId);
    openCommentKey.value = openCommentKey.value === key ? '' : key;
};
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
    Object.keys(assignments).forEach((k) => delete assignments[k]);
    Object.keys(pendingOptionByTask).forEach((k) => delete pendingOptionByTask[k]);
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({ title: 'Сопоставь одно с другим' });
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['match-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__table']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__table']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__table']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "match-test" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.title);
if (__VLS_ctx.descriptionMarkdown) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "match-test__description" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedDescription) }, null, null);
}
if (__VLS_ctx.checkMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "match-test__stats" },
    });
    (__VLS_ctx.correctRowsCount);
    (__VLS_ctx.totalRowsCount);
}
for (const [task] of __VLS_getVForSourceType((__VLS_ctx.tasks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (task.id),
        ...{ class: "match-test__task" },
    });
    if (task.title) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (task.title);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
        ...{ class: "match-test__table" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    (task.leftColumnTitle || 'Предложение');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
    (task.rightColumnTitle || 'Сопоставление');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
    for (const [row] of __VLS_getVForSourceType((task.rows))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: (row.id),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        (row.prompt);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onDragover: () => { } },
            ...{ onDrop: (...[$event]) => {
                    __VLS_ctx.onRowDrop(task.id, row.id, $event);
                } },
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.onDropzoneClick(task.id, row.id);
                } },
            ...{ class: "match-test__dropzone" },
            ...{ class: (__VLS_ctx.getDropzoneClass(task.id, row.id)) },
            'data-task-id': (task.id),
            'data-row-id': (row.id),
        });
        if (__VLS_ctx.showAnswersMode && __VLS_ctx.hasWrongAssignment(task.id, row.id)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "match-test__wrong-chip" },
            });
            (__VLS_ctx.getAssignedText(task.id, row.id));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "match-test__chip" },
            ...{ class: ({ 'match-test__chip--placeholder': __VLS_ctx.isPlaceholder(task.id, row.id) }) },
        });
        (__VLS_ctx.getDisplayedText(task.id, row.id));
        if (__VLS_ctx.showAnswersMode && row.commentMarkdown) {
            /** @type {[typeof AnswerCommentPopover, ]} */ ;
            // @ts-ignore
            const __VLS_0 = __VLS_asFunctionalComponent(AnswerCommentPopover, new AnswerCommentPopover({
                ...{ 'onToggle': {} },
                markdown: (row.commentMarkdown),
                isOpen: (__VLS_ctx.openCommentKey === __VLS_ctx.makeKey(task.id, row.id)),
            }));
            const __VLS_1 = __VLS_0({
                ...{ 'onToggle': {} },
                markdown: (row.commentMarkdown),
                isOpen: (__VLS_ctx.openCommentKey === __VLS_ctx.makeKey(task.id, row.id)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_0));
            let __VLS_3;
            let __VLS_4;
            let __VLS_5;
            const __VLS_6 = {
                onToggle: (...[$event]) => {
                    if (!(__VLS_ctx.showAnswersMode && row.commentMarkdown))
                        return;
                    __VLS_ctx.toggleComment(task.id, row.id);
                }
            };
            var __VLS_2;
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "match-test__bank" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "match-test__bank-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "match-test__answers" },
    });
    for (const [option] of __VLS_getVForSourceType((__VLS_ctx.getAvailableOptions(task.id)))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.onAnswerClick(task.id, option.id);
                } },
            ...{ onDragstart: (...[$event]) => {
                    __VLS_ctx.onAnswerDragStart(task.id, option.id, $event);
                } },
            ...{ onTouchstart: (...[$event]) => {
                    __VLS_ctx.onAnswerTouchStart(task.id, option.id);
                } },
            ...{ onTouchend: (...[$event]) => {
                    __VLS_ctx.onAnswerTouchEnd($event);
                } },
            key: (option.id),
            ...{ class: "match-test__answer-chip" },
            ...{ class: ({ 'match-test__answer-chip--active': __VLS_ctx.getPendingOption(task.id) === option.id }) },
            type: "button",
            draggable: "true",
        });
        (option.text);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "match-test__actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.checkAnswers) },
    ...{ class: "match-test__check-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.showAnswers) },
    ...{ class: "match-test__secondary-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetFeedback) },
    ...{ class: "match-test__secondary-btn" },
    type: "button",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.restartTest) },
    ...{ class: "match-test__secondary-btn" },
    type: "button",
});
/** @type {__VLS_StyleScopedClasses['match-test']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__description']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__stats']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__task']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__table']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__dropzone']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__wrong-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__chip']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__bank']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__bank-title']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__answers']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__answer-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__check-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__secondary-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__secondary-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AnswerCommentPopover: AnswerCommentPopover,
            renderedDescription: renderedDescription,
            checkMode: checkMode,
            showAnswersMode: showAnswersMode,
            openCommentKey: openCommentKey,
            makeKey: makeKey,
            getPendingOption: getPendingOption,
            getAvailableOptions: getAvailableOptions,
            onAnswerClick: onAnswerClick,
            onDropzoneClick: onDropzoneClick,
            onAnswerDragStart: onAnswerDragStart,
            onRowDrop: onRowDrop,
            onAnswerTouchStart: onAnswerTouchStart,
            onAnswerTouchEnd: onAnswerTouchEnd,
            hasWrongAssignment: hasWrongAssignment,
            getAssignedText: getAssignedText,
            getDisplayedText: getDisplayedText,
            isPlaceholder: isPlaceholder,
            getDropzoneClass: getDropzoneClass,
            totalRowsCount: totalRowsCount,
            correctRowsCount: correctRowsCount,
            checkAnswers: checkAnswers,
            toggleComment: toggleComment,
            showAnswers: showAnswers,
            resetFeedback: resetFeedback,
            restartTest: restartTest,
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
