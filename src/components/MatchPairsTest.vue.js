import { computed, reactive, ref, watch } from 'vue';
import AnswerCommentPopover from './AnswerCommentPopover.vue';
import { renderMarkdown } from '../utils/markdown';
const props = withDefaults(defineProps(), { title: 'Сопоставь одно с другим', showProgress: true });
const emit = defineEmits();
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''));
const assignments = reactive({});
const pendingOptionByTask = reactive({});
const optionOrderByTask = reactive({});
const draggingTaskId = ref('');
const draggingOptionId = ref('');
const checkMode = ref(false);
const showAnswersMode = ref(false);
const openCommentKey = ref('');
const isTouchDragging = ref(false);
const touchDragPreviewText = ref('');
const touchTargetDropzoneKey = ref('');
const touchPointer = reactive({ x: 0, y: 0 });
const hasWarnedConfigIssues = ref(false);
const makeKey = (taskId, rowId) => `${taskId}::${rowId}`;
const findTask = (taskId) => props.tasks.find((t) => t.id === taskId);
const findRow = (taskId, rowId) => findTask(taskId)?.rows.find((r) => r.id === rowId);
const findOption = (taskId, optionId) => findTask(taskId)?.options.find((o) => o.id === optionId);
const shuffleArray = (items) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
};
const randomizeTaskOptionOrders = () => {
    const activeTaskIds = new Set(props.tasks.map((task) => task.id));
    Object.keys(optionOrderByTask).forEach((taskId) => {
        if (!activeTaskIds.has(taskId))
            delete optionOrderByTask[taskId];
    });
    props.tasks.forEach((task) => {
        optionOrderByTask[task.id] = shuffleArray(task.options.map((option) => option.id));
    });
};
const collectDuplicateIds = (ids) => {
    const seen = new Set();
    const duplicates = new Set();
    ids.forEach((id) => {
        if (seen.has(id))
            duplicates.add(id);
        else
            seen.add(id);
    });
    return [...duplicates];
};
const validateTasksConfig = () => {
    if (!import.meta.env.DEV || hasWarnedConfigIssues.value)
        return;
    const warnings = [];
    props.tasks.forEach((task) => {
        const duplicateRowIds = collectDuplicateIds(task.rows.map((row) => row.id));
        if (duplicateRowIds.length > 0) {
            warnings.push(`[task:${task.id}] duplicate row ids: ${duplicateRowIds.join(', ')}`);
        }
        const duplicateOptionIds = collectDuplicateIds(task.options.map((option) => option.id));
        if (duplicateOptionIds.length > 0) {
            warnings.push(`[task:${task.id}] duplicate option ids: ${duplicateOptionIds.join(', ')}`);
        }
        const optionIdSet = new Set(task.options.map((option) => option.id));
        const invalidCorrectOptionIds = task.rows
            .filter((row) => !optionIdSet.has(row.correctOptionId))
            .map((row) => `${row.id}->${row.correctOptionId}`);
        if (invalidCorrectOptionIds.length > 0) {
            warnings.push(`[task:${task.id}] rows reference missing options: ${invalidCorrectOptionIds.join(', ')}`);
        }
    });
    if (warnings.length === 0)
        return;
    hasWarnedConfigIssues.value = true;
    console.warn(`[LangTest][MatchPairsTest] Potential config issues detected:\n${warnings.map((item) => `- ${item}`).join('\n')}`);
};
const getPendingOption = (taskId) => pendingOptionByTask[taskId] ?? '';
const clearTouchDragState = () => {
    isTouchDragging.value = false;
    touchDragPreviewText.value = '';
    touchTargetDropzoneKey.value = '';
};
const updateTouchHover = (touch) => {
    touchPointer.x = touch.clientX + 14;
    touchPointer.y = touch.clientY + 14;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropzone = target?.closest('.match-test__dropzone');
    if (!dropzone) {
        touchTargetDropzoneKey.value = '';
        return;
    }
    const taskId = dropzone.dataset.taskId ?? '';
    const rowId = dropzone.dataset.rowId ?? '';
    if (taskId === draggingTaskId.value && rowId) {
        touchTargetDropzoneKey.value = makeKey(taskId, rowId);
        return;
    }
    touchTargetDropzoneKey.value = '';
};
const getAvailableOptions = (taskId) => {
    const task = findTask(taskId);
    if (!task)
        return [];
    const assigned = new Set(task.rows.map((r) => assignments[makeKey(taskId, r.id)]).filter(Boolean));
    const optionsById = new Map(task.options.map((option) => [option.id, option]));
    const orderedOptionIds = optionOrderByTask[taskId] ?? task.options.map((option) => option.id);
    const orderedOptions = orderedOptionIds
        .map((optionId) => optionsById.get(optionId))
        .filter((option) => option !== undefined);
    return orderedOptions.filter((option) => !assigned.has(option.id));
};
const unassignOptionFromTask = (taskId, optionId) => {
    const task = findTask(taskId);
    if (!task)
        return;
    task.rows.forEach((row) => {
        if (assignments[makeKey(taskId, row.id)] === optionId)
            delete assignments[makeKey(taskId, row.id)];
    });
};
const assignOptionToRow = (taskId, rowId, optionId) => {
    checkMode.value = false;
    showAnswersMode.value = false;
    openCommentKey.value = '';
    unassignOptionFromTask(taskId, optionId);
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
    event.dataTransfer?.setData('text/plain', `${taskId}::${optionId}::`);
};
const onAssignedDragStart = (taskId, rowId, event) => {
    const optionId = getAssignedOptionId(taskId, rowId);
    if (!optionId)
        return;
    draggingTaskId.value = taskId;
    draggingOptionId.value = optionId;
    event.dataTransfer?.setData('text/plain', `${taskId}::${optionId}::${rowId}`);
};
const onRowDrop = (taskId, rowId, event) => {
    const payload = event.dataTransfer?.getData('text/plain') ?? '';
    const [payloadTaskId, payloadOptionId] = payload.split('::');
    const sourceTaskId = payloadTaskId || draggingTaskId.value;
    const optionId = payloadOptionId || draggingOptionId.value;
    if (sourceTaskId === taskId && optionId)
        assignOptionToRow(taskId, rowId, optionId);
    draggingTaskId.value = '';
    draggingOptionId.value = '';
};
const onBankDrop = (taskId, event) => {
    const payload = event.dataTransfer?.getData('text/plain') ?? '';
    const [payloadTaskId, payloadOptionId] = payload.split('::');
    const sourceTaskId = payloadTaskId || draggingTaskId.value;
    const optionId = payloadOptionId || draggingOptionId.value;
    if (sourceTaskId !== taskId || !optionId)
        return;
    checkMode.value = false;
    showAnswersMode.value = false;
    openCommentKey.value = '';
    unassignOptionFromTask(taskId, optionId);
    draggingTaskId.value = '';
    draggingOptionId.value = '';
};
const onAnswerTouchStart = (taskId, optionId) => {
    draggingTaskId.value = taskId;
    draggingOptionId.value = optionId;
    isTouchDragging.value = true;
    touchDragPreviewText.value = findOption(taskId, optionId)?.text ?? '';
};
const onAssignedTouchStart = (taskId, rowId) => {
    const optionId = getAssignedOptionId(taskId, rowId);
    if (!optionId)
        return;
    draggingTaskId.value = taskId;
    draggingOptionId.value = optionId;
    isTouchDragging.value = true;
    touchDragPreviewText.value = getAssignedText(taskId, rowId);
};
const onTouchMove = (event) => {
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch || !isTouchDragging.value)
        return;
    updateTouchHover(touch);
};
const onTouchEnd = (event) => {
    const touch = event.changedTouches[0];
    if (!touch)
        return;
    updateTouchHover(touch);
    if (touchTargetDropzoneKey.value) {
        const [taskId, rowId] = touchTargetDropzoneKey.value.split('::');
        if (taskId && rowId && taskId === draggingTaskId.value && draggingOptionId.value) {
            assignOptionToRow(taskId, rowId, draggingOptionId.value);
        }
        draggingTaskId.value = '';
        draggingOptionId.value = '';
        clearTouchDragState();
        return;
    }
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropzone = target?.closest('.match-test__dropzone');
    if (dropzone) {
        const taskId = dropzone.dataset.taskId ?? '';
        const rowId = dropzone.dataset.rowId ?? '';
        if (taskId && rowId && taskId === draggingTaskId.value && draggingOptionId.value) {
            assignOptionToRow(taskId, rowId, draggingOptionId.value);
        }
        draggingTaskId.value = '';
        draggingOptionId.value = '';
        clearTouchDragState();
        return;
    }
    const bank = target?.closest('.match-test__answers');
    if (bank) {
        const taskId = bank.dataset.taskId ?? '';
        if (taskId && taskId === draggingTaskId.value && draggingOptionId.value) {
            checkMode.value = false;
            showAnswersMode.value = false;
            openCommentKey.value = '';
            unassignOptionFromTask(taskId, draggingOptionId.value);
        }
    }
    draggingTaskId.value = '';
    draggingOptionId.value = '';
    clearTouchDragState();
};
const normalizeMatchText = (value) => value.trim().toLowerCase();
const isOptionEquivalentToRowCorrectAnswer = (taskId, rowId, optionId) => {
    const row = findRow(taskId, rowId);
    if (!row)
        return false;
    if (optionId === row.correctOptionId)
        return true;
    const optionText = findOption(taskId, optionId)?.text;
    const correctOptionText = findOption(taskId, row.correctOptionId)?.text;
    if (!optionText || !correctOptionText)
        return false;
    return normalizeMatchText(optionText) === normalizeMatchText(correctOptionText);
};
const isRowCorrect = (taskId, rowId) => {
    const assignedOptionId = assignments[makeKey(taskId, rowId)];
    if (!assignedOptionId)
        return false;
    return isOptionEquivalentToRowCorrectAnswer(taskId, rowId, assignedOptionId);
};
const hasWrongAssignment = (taskId, rowId) => Boolean(assignments[makeKey(taskId, rowId)]) && !isRowCorrect(taskId, rowId);
const getAssignedText = (taskId, rowId) => {
    const assigned = assignments[makeKey(taskId, rowId)];
    return assigned ? findOption(taskId, assigned)?.text ?? '' : '';
};
const getAssignedOptionId = (taskId, rowId) => assignments[makeKey(taskId, rowId)] ?? '';
const isAssigned = (taskId, rowId) => Boolean(getAssignedOptionId(taskId, rowId));
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
const totalTasksCount = computed(() => props.tasks.length);
const isTaskCompleted = (taskId) => {
    const task = findTask(taskId);
    if (!task)
        return false;
    return task.rows.every((row) => Boolean(assignments[makeKey(taskId, row.id)]));
};
const isTaskCorrect = (taskId) => {
    const task = findTask(taskId);
    if (!task)
        return false;
    return task.rows.every((row) => isRowCorrect(taskId, row.id));
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
    clearTouchDragState();
    randomizeTaskOptionOrders();
};
const toBoolean = (value) => value === true;
const normalizeState = (state) => {
    const raw = (state ?? {});
    const assignmentsByTask = {};
    props.tasks.forEach((task) => {
        assignmentsByTask[task.id] = {};
        const usedOptionIds = new Set();
        task.rows.forEach((row) => {
            const rowKey = makeKey(task.id, row.id);
            const candidateOptionId = raw.assignments?.[rowKey];
            if (typeof candidateOptionId !== 'string')
                return;
            const isOptionValid = task.options.some((option) => option.id === candidateOptionId);
            if (!isOptionValid || usedOptionIds.has(candidateOptionId))
                return;
            assignmentsByTask[task.id][row.id] = candidateOptionId;
            usedOptionIds.add(candidateOptionId);
        });
    });
    const normalizedAssignments = {};
    Object.entries(assignmentsByTask).forEach(([taskId, rowMap]) => {
        Object.entries(rowMap).forEach(([rowId, optionId]) => {
            normalizedAssignments[makeKey(taskId, rowId)] = optionId;
        });
    });
    return {
        assignments: normalizedAssignments,
        checkMode: toBoolean(raw.checkMode),
        showAnswersMode: toBoolean(raw.showAnswersMode),
    };
};
const applyState = (state) => {
    const normalized = normalizeState(state);
    Object.keys(assignments).forEach((key) => delete assignments[key]);
    Object.entries(normalized.assignments).forEach(([rowKey, optionId]) => {
        assignments[rowKey] = optionId;
    });
    Object.keys(pendingOptionByTask).forEach((key) => delete pendingOptionByTask[key]);
    checkMode.value = normalized.checkMode;
    showAnswersMode.value = normalized.showAnswersMode;
    openCommentKey.value = '';
};
const getState = () => normalizeState({
    assignments,
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
    validateTasksConfig();
    randomizeTaskOptionOrders();
    applyState(getState());
}, { immediate: true, deep: true });
watch([assignments, checkMode, showAnswersMode], () => {
    emit('state-change', getState());
}, { immediate: true, deep: true });
let __VLS_exposed;
defineExpose({ getState, setState });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({ title: 'Сопоставь одно с другим', showProgress: true });
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
if (__VLS_ctx.showProgress) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "match-test__progress" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "match-test__progress-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "match-test__progress-label" },
    });
    (__VLS_ctx.completedTasksCount);
    (__VLS_ctx.totalTasksCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "match-test__progress-stats" },
    });
    (__VLS_ctx.correctCheckedTasksCount);
    (__VLS_ctx.checkedTasksCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "match-test__progress-track" },
        role: "progressbar",
        'aria-valuemin': (0),
        'aria-valuemax': (__VLS_ctx.totalTasksCount),
        'aria-valuenow': (__VLS_ctx.completedTasksCount),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "match-test__progress-fill" },
        ...{ style: ({ width: `${__VLS_ctx.progressPercent}%` }) },
    });
}
for (const [task] of __VLS_getVForSourceType((__VLS_ctx.tasks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (task.id),
        ...{ class: "match-test__task" },
    });
    if (__VLS_ctx.isTaskCompleted(task.id)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "match-test__completed-mark" },
            'aria-hidden': "true",
        });
    }
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
            ...{ class: ([
                    __VLS_ctx.getDropzoneClass(task.id, row.id),
                    {
                        'match-test__dropzone--touch-ready': __VLS_ctx.isTouchDragging && __VLS_ctx.draggingTaskId === task.id && !__VLS_ctx.showAnswersMode,
                        'match-test__dropzone--touch-target': __VLS_ctx.touchTargetDropzoneKey === __VLS_ctx.makeKey(task.id, row.id),
                    },
                ]) },
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
            ...{ onDragstart: (...[$event]) => {
                    __VLS_ctx.onAssignedDragStart(task.id, row.id, $event);
                } },
            ...{ onTouchstart: (...[$event]) => {
                    __VLS_ctx.onAssignedTouchStart(task.id, row.id);
                } },
            ...{ onTouchmove: (...[$event]) => {
                    __VLS_ctx.onTouchMove($event);
                } },
            ...{ onTouchend: (...[$event]) => {
                    __VLS_ctx.onTouchEnd($event);
                } },
            ...{ class: "match-test__chip" },
            ...{ class: ({
                    'match-test__chip--placeholder': __VLS_ctx.isPlaceholder(task.id, row.id),
                    'match-test__chip--draggable': __VLS_ctx.isAssigned(task.id, row.id) && !__VLS_ctx.showAnswersMode,
                }) },
            draggable: (__VLS_ctx.isAssigned(task.id, row.id) && !__VLS_ctx.showAnswersMode),
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
        ...{ onDragover: () => { } },
        ...{ onDrop: (...[$event]) => {
                __VLS_ctx.onBankDrop(task.id, $event);
            } },
        ...{ class: "match-test__answers" },
        'data-task-id': (task.id),
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
            ...{ onTouchmove: (...[$event]) => {
                    __VLS_ctx.onTouchMove($event);
                } },
            ...{ onTouchend: (...[$event]) => {
                    __VLS_ctx.onTouchEnd($event);
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
if (__VLS_ctx.isTouchDragging && __VLS_ctx.touchDragPreviewText) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "match-test__touch-preview" },
        ...{ style: ({ transform: `translate(${__VLS_ctx.touchPointer.x}px, ${__VLS_ctx.touchPointer.y}px)` }) },
    });
    (__VLS_ctx.touchDragPreviewText);
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
/** @type {__VLS_StyleScopedClasses['match-test__progress']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__progress-head']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__progress-label']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__progress-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__progress-track']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__progress-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__task']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__completed-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__table']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__dropzone']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__wrong-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__chip']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__bank']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__bank-title']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__answers']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__answer-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['match-test__touch-preview']} */ ;
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
            draggingTaskId: draggingTaskId,
            showAnswersMode: showAnswersMode,
            openCommentKey: openCommentKey,
            isTouchDragging: isTouchDragging,
            touchDragPreviewText: touchDragPreviewText,
            touchTargetDropzoneKey: touchTargetDropzoneKey,
            touchPointer: touchPointer,
            makeKey: makeKey,
            getPendingOption: getPendingOption,
            getAvailableOptions: getAvailableOptions,
            onAnswerClick: onAnswerClick,
            onDropzoneClick: onDropzoneClick,
            onAnswerDragStart: onAnswerDragStart,
            onAssignedDragStart: onAssignedDragStart,
            onRowDrop: onRowDrop,
            onBankDrop: onBankDrop,
            onAnswerTouchStart: onAnswerTouchStart,
            onAssignedTouchStart: onAssignedTouchStart,
            onTouchMove: onTouchMove,
            onTouchEnd: onTouchEnd,
            hasWrongAssignment: hasWrongAssignment,
            getAssignedText: getAssignedText,
            isAssigned: isAssigned,
            getDisplayedText: getDisplayedText,
            isPlaceholder: isPlaceholder,
            getDropzoneClass: getDropzoneClass,
            totalTasksCount: totalTasksCount,
            isTaskCompleted: isTaskCompleted,
            completedTasksCount: completedTasksCount,
            progressPercent: progressPercent,
            checkedTasksCount: checkedTasksCount,
            correctCheckedTasksCount: correctCheckedTasksCount,
            checkAnswers: checkAnswers,
            toggleComment: toggleComment,
            showAnswers: showAnswers,
            resetFeedback: resetFeedback,
            restartTest: restartTest,
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
