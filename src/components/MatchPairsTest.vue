<template>
  <section class="match-test">
    <h2>{{ title }}</h2>
    <div v-if="descriptionMarkdown" class="match-test__description" v-html="renderedDescription"></div>
    <div v-if="showProgress" class="match-test__progress">
      <div class="match-test__progress-head">
        <p class="match-test__progress-label">Прогресс: {{ completedTasksCount }} из {{ totalTasksCount }}</p>
        <p class="match-test__progress-stats">Правильно: {{ correctCheckedTasksCount }} из {{ checkedTasksCount }}</p>
      </div>
      <div
        class="match-test__progress-track"
        role="progressbar"
        :aria-valuemin="0"
        :aria-valuemax="totalTasksCount"
        :aria-valuenow="completedTasksCount"
      >
        <div class="match-test__progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>

    <article v-for="task in tasks" :key="task.id" class="match-test__task">
      <span v-if="isTaskCompleted(task.id)" class="match-test__completed-mark" aria-hidden="true">✓</span>
      <h3 v-if="task.title">{{ task.title }}</h3>
      <table class="match-test__table">
        <thead>
          <tr>
            <th>{{ task.leftColumnTitle || 'Предложение' }}</th>
            <th>{{ task.rightColumnTitle || 'Сопоставление' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in task.rows" :key="row.id">
            <td>{{ row.prompt }}</td>
            <td>
              <div
                class="match-test__dropzone"
                :class="[
                  getDropzoneClass(task.id, row.id),
                  {
                    'match-test__dropzone--touch-ready':
                      isTouchDragging && draggingTaskId === task.id && !showAnswersMode,
                    'match-test__dropzone--touch-target': touchTargetDropzoneKey === makeKey(task.id, row.id),
                  },
                ]"
                :data-task-id="task.id"
                :data-row-id="row.id"
                @dragover.prevent
                @drop="onRowDrop(task.id, row.id, $event)"
                @click="onDropzoneClick(task.id, row.id)"
              >
                <span
                  v-if="showAnswersMode && hasWrongAssignment(task.id, row.id)"
                  class="match-test__wrong-chip"
                >
                  {{ getAssignedText(task.id, row.id) }}
                </span>
                <span
                  class="match-test__chip"
                  :class="{
                    'match-test__chip--placeholder': isPlaceholder(task.id, row.id),
                    'match-test__chip--draggable': isAssigned(task.id, row.id) && !showAnswersMode,
                  }"
                  :draggable="isAssigned(task.id, row.id) && !showAnswersMode"
                  @dragstart="onAssignedDragStart(task.id, row.id, $event)"
                  @touchstart.prevent="onAssignedTouchStart(task.id, row.id)"
                  @touchmove.prevent="onTouchMove($event)"
                  @touchend.prevent="onTouchEnd($event)"
                >
                  {{ getDisplayedText(task.id, row.id) }}
                </span>
                <AnswerCommentPopover
                  v-if="showAnswersMode && row.commentMarkdown"
                  :markdown="row.commentMarkdown"
                  :is-open="openCommentKey === makeKey(task.id, row.id)"
                  @toggle="toggleComment(task.id, row.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="match-test__bank">
        <p class="match-test__bank-title">Ответы:</p>
        <div class="match-test__answers" :data-task-id="task.id" @dragover.prevent @drop="onBankDrop(task.id, $event)">
          <button
            v-for="option in getAvailableOptions(task.id)"
            :key="option.id"
            class="match-test__answer-chip"
            :class="{ 'match-test__answer-chip--active': getPendingOption(task.id) === option.id }"
            type="button"
            draggable="true"
            @click="onAnswerClick(task.id, option.id)"
            @dragstart="onAnswerDragStart(task.id, option.id, $event)"
            @touchstart.prevent="onAnswerTouchStart(task.id, option.id)"
            @touchmove.prevent="onTouchMove($event)"
            @touchend.prevent="onTouchEnd($event)"
          >
            {{ option.text }}
          </button>
        </div>
      </div>
    </article>
    <div
      v-if="isTouchDragging && touchDragPreviewText"
      class="match-test__touch-preview"
      :style="{ transform: `translate(${touchPointer.x}px, ${touchPointer.y}px)` }"
    >
      {{ touchDragPreviewText }}
    </div>

    <div class="match-test__actions">
      <button class="match-test__check-btn" type="button" @click="checkAnswers">Проверить</button>
      <button class="match-test__secondary-btn" type="button" @click="showAnswers">Показать правильные ответы</button>
      <button class="match-test__secondary-btn" type="button" @click="resetFeedback">Сброс</button>
      <button class="match-test__secondary-btn" type="button" @click="restartTest">Начать заново</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AnswerCommentPopover from './AnswerCommentPopover.vue'
import { renderMarkdown } from '../utils/markdown'
import type { MatchOption, MatchRow, MatchTask } from '../types/component-contracts'
import type { MatchPairsState, StatefulTestComponentHandle } from '../types/test-state'

interface Props {
  title?: string
  descriptionMarkdown?: string
  showProgress?: boolean
  tasks: MatchTask[]
  initialState?: MatchPairsState
}

const props = withDefaults(defineProps<Props>(), { title: 'Сопоставь одно с другим', showProgress: true })
const emit = defineEmits<{
  (
    event: 'progress-change',
    payload: { completed: number; total: number; correctChecked: number; checked: number },
  ): void
  (event: 'state-change', payload: MatchPairsState): void
}>()
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''))
const assignments = reactive<Record<string, string>>({})
const pendingOptionByTask = reactive<Record<string, string>>({})
const optionOrderByTask = reactive<Record<string, string[]>>({})
const draggingTaskId = ref('')
const draggingOptionId = ref('')
const checkMode = ref(false)
const showAnswersMode = ref(false)
const openCommentKey = ref('')
const isTouchDragging = ref(false)
const touchDragPreviewText = ref('')
const touchTargetDropzoneKey = ref('')
const touchPointer = reactive({ x: 0, y: 0 })
const hasWarnedConfigIssues = ref(false)

const makeKey = (taskId: string, rowId: string): string => `${taskId}::${rowId}`
const findTask = (taskId: string): MatchTask | undefined => props.tasks.find((t) => t.id === taskId)
const findRow = (taskId: string, rowId: string): MatchRow | undefined =>
  findTask(taskId)?.rows.find((r) => r.id === rowId)
const findOption = (taskId: string, optionId: string): MatchOption | undefined =>
  findTask(taskId)?.options.find((o) => o.id === optionId)
const shuffleArray = <T,>(items: T[]): T[] => {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled
}
const randomizeTaskOptionOrders = (): void => {
  const activeTaskIds = new Set(props.tasks.map((task) => task.id))
  Object.keys(optionOrderByTask).forEach((taskId) => {
    if (!activeTaskIds.has(taskId)) delete optionOrderByTask[taskId]
  })
  props.tasks.forEach((task) => {
    optionOrderByTask[task.id] = shuffleArray(task.options.map((option) => option.id))
  })
}
const collectDuplicateIds = (ids: string[]): string[] => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  ids.forEach((id) => {
    if (seen.has(id)) duplicates.add(id)
    else seen.add(id)
  })
  return [...duplicates]
}
const validateTasksConfig = (): void => {
  if (!import.meta.env.DEV || hasWarnedConfigIssues.value) return
  const warnings: string[] = []
  props.tasks.forEach((task) => {
    const duplicateRowIds = collectDuplicateIds(task.rows.map((row) => row.id))
    if (duplicateRowIds.length > 0) {
      warnings.push(`[task:${task.id}] duplicate row ids: ${duplicateRowIds.join(', ')}`)
    }

    const duplicateOptionIds = collectDuplicateIds(task.options.map((option) => option.id))
    if (duplicateOptionIds.length > 0) {
      warnings.push(`[task:${task.id}] duplicate option ids: ${duplicateOptionIds.join(', ')}`)
    }

    const optionIdSet = new Set(task.options.map((option) => option.id))
    const invalidCorrectOptionIds = task.rows
      .filter((row) => !optionIdSet.has(row.correctOptionId))
      .map((row) => `${row.id}->${row.correctOptionId}`)
    if (invalidCorrectOptionIds.length > 0) {
      warnings.push(
        `[task:${task.id}] rows reference missing options: ${invalidCorrectOptionIds.join(', ')}`,
      )
    }
  })
  if (warnings.length === 0) return
  hasWarnedConfigIssues.value = true
  console.warn(
    `[LangTest][MatchPairsTest] Potential config issues detected:\n${warnings.map((item) => `- ${item}`).join('\n')}`,
  )
}

const getPendingOption = (taskId: string): string => pendingOptionByTask[taskId] ?? ''
const clearTouchDragState = (): void => {
  isTouchDragging.value = false
  touchDragPreviewText.value = ''
  touchTargetDropzoneKey.value = ''
}
const updateTouchHover = (touch: Touch): void => {
  touchPointer.x = touch.clientX + 14
  touchPointer.y = touch.clientY + 14
  const target = document.elementFromPoint(touch.clientX, touch.clientY)
  const dropzone = target?.closest('.match-test__dropzone') as HTMLElement | null
  if (!dropzone) {
    touchTargetDropzoneKey.value = ''
    return
  }
  const taskId = dropzone.dataset.taskId ?? ''
  const rowId = dropzone.dataset.rowId ?? ''
  if (taskId === draggingTaskId.value && rowId) {
    touchTargetDropzoneKey.value = makeKey(taskId, rowId)
    return
  }
  touchTargetDropzoneKey.value = ''
}
const getAvailableOptions = (taskId: string): MatchOption[] => {
  const task = findTask(taskId)
  if (!task) return []
  const assigned = new Set(task.rows.map((r) => assignments[makeKey(taskId, r.id)]).filter(Boolean))
  const optionsById = new Map(task.options.map((option) => [option.id, option]))
  const orderedOptionIds = optionOrderByTask[taskId] ?? task.options.map((option) => option.id)
  const orderedOptions = orderedOptionIds
    .map((optionId) => optionsById.get(optionId))
    .filter((option): option is MatchOption => option !== undefined)
  return orderedOptions.filter((option) => !assigned.has(option.id))
}
const unassignOptionFromTask = (taskId: string, optionId: string): void => {
  const task = findTask(taskId)
  if (!task) return
  task.rows.forEach((row) => {
    if (assignments[makeKey(taskId, row.id)] === optionId) delete assignments[makeKey(taskId, row.id)]
  })
}
const assignOptionToRow = (taskId: string, rowId: string, optionId: string): void => {
  checkMode.value = false
  showAnswersMode.value = false
  openCommentKey.value = ''
  unassignOptionFromTask(taskId, optionId)
  assignments[makeKey(taskId, rowId)] = optionId
  pendingOptionByTask[taskId] = ''
}
const onAnswerClick = (taskId: string, optionId: string): void => {
  pendingOptionByTask[taskId] = pendingOptionByTask[taskId] === optionId ? '' : optionId
}
const onDropzoneClick = (taskId: string, rowId: string): void => {
  const optionId = getPendingOption(taskId)
  if (optionId) assignOptionToRow(taskId, rowId, optionId)
}
const onAnswerDragStart = (taskId: string, optionId: string, event: DragEvent): void => {
  draggingTaskId.value = taskId
  draggingOptionId.value = optionId
  event.dataTransfer?.setData('text/plain', `${taskId}::${optionId}::`)
}
const onAssignedDragStart = (taskId: string, rowId: string, event: DragEvent): void => {
  const optionId = getAssignedOptionId(taskId, rowId)
  if (!optionId) return
  draggingTaskId.value = taskId
  draggingOptionId.value = optionId
  event.dataTransfer?.setData('text/plain', `${taskId}::${optionId}::${rowId}`)
}
const onRowDrop = (taskId: string, rowId: string, event: DragEvent): void => {
  const payload = event.dataTransfer?.getData('text/plain') ?? ''
  const [payloadTaskId, payloadOptionId] = payload.split('::')
  const sourceTaskId = payloadTaskId || draggingTaskId.value
  const optionId = payloadOptionId || draggingOptionId.value
  if (sourceTaskId === taskId && optionId) assignOptionToRow(taskId, rowId, optionId)
  draggingTaskId.value = ''
  draggingOptionId.value = ''
}
const onBankDrop = (taskId: string, event: DragEvent): void => {
  const payload = event.dataTransfer?.getData('text/plain') ?? ''
  const [payloadTaskId, payloadOptionId] = payload.split('::')
  const sourceTaskId = payloadTaskId || draggingTaskId.value
  const optionId = payloadOptionId || draggingOptionId.value
  if (sourceTaskId !== taskId || !optionId) return

  checkMode.value = false
  showAnswersMode.value = false
  openCommentKey.value = ''
  unassignOptionFromTask(taskId, optionId)

  draggingTaskId.value = ''
  draggingOptionId.value = ''
}
const onAnswerTouchStart = (taskId: string, optionId: string): void => {
  draggingTaskId.value = taskId
  draggingOptionId.value = optionId
  isTouchDragging.value = true
  touchDragPreviewText.value = findOption(taskId, optionId)?.text ?? ''
}
const onAssignedTouchStart = (taskId: string, rowId: string): void => {
  const optionId = getAssignedOptionId(taskId, rowId)
  if (!optionId) return
  draggingTaskId.value = taskId
  draggingOptionId.value = optionId
  isTouchDragging.value = true
  touchDragPreviewText.value = getAssignedText(taskId, rowId)
}
const onTouchMove = (event: TouchEvent): void => {
  const touch = event.touches[0] ?? event.changedTouches[0]
  if (!touch || !isTouchDragging.value) return
  updateTouchHover(touch)
}
const onTouchEnd = (event: TouchEvent): void => {
  const touch = event.changedTouches[0]
  if (!touch) return
  updateTouchHover(touch)
  if (touchTargetDropzoneKey.value) {
    const [taskId, rowId] = touchTargetDropzoneKey.value.split('::')
    if (taskId && rowId && taskId === draggingTaskId.value && draggingOptionId.value) {
      assignOptionToRow(taskId, rowId, draggingOptionId.value)
    }
    draggingTaskId.value = ''
    draggingOptionId.value = ''
    clearTouchDragState()
    return
  }
  const target = document.elementFromPoint(touch.clientX, touch.clientY)
  const dropzone = target?.closest('.match-test__dropzone') as HTMLElement | null
  if (dropzone) {
    const taskId = dropzone.dataset.taskId ?? ''
    const rowId = dropzone.dataset.rowId ?? ''
    if (taskId && rowId && taskId === draggingTaskId.value && draggingOptionId.value) {
      assignOptionToRow(taskId, rowId, draggingOptionId.value)
    }
    draggingTaskId.value = ''
    draggingOptionId.value = ''
    clearTouchDragState()
    return
  }

  const bank = target?.closest('.match-test__answers') as HTMLElement | null
  if (bank) {
    const taskId = bank.dataset.taskId ?? ''
    if (taskId && taskId === draggingTaskId.value && draggingOptionId.value) {
      checkMode.value = false
      showAnswersMode.value = false
      openCommentKey.value = ''
      unassignOptionFromTask(taskId, draggingOptionId.value)
    }
  }

  draggingTaskId.value = ''
  draggingOptionId.value = ''
  clearTouchDragState()
}

const normalizeMatchText = (value: string): string => value.trim().toLowerCase()
const isOptionEquivalentToRowCorrectAnswer = (taskId: string, rowId: string, optionId: string): boolean => {
  const row = findRow(taskId, rowId)
  if (!row) return false
  if (optionId === row.correctOptionId) return true
  const optionText = findOption(taskId, optionId)?.text
  const correctOptionText = findOption(taskId, row.correctOptionId)?.text
  if (!optionText || !correctOptionText) return false
  return normalizeMatchText(optionText) === normalizeMatchText(correctOptionText)
}
const isRowCorrect = (taskId: string, rowId: string): boolean => {
  const assignedOptionId = assignments[makeKey(taskId, rowId)]
  if (!assignedOptionId) return false
  return isOptionEquivalentToRowCorrectAnswer(taskId, rowId, assignedOptionId)
}
const hasWrongAssignment = (taskId: string, rowId: string): boolean =>
  Boolean(assignments[makeKey(taskId, rowId)]) && !isRowCorrect(taskId, rowId)
const getAssignedText = (taskId: string, rowId: string): string => {
  const assigned = assignments[makeKey(taskId, rowId)]
  return assigned ? findOption(taskId, assigned)?.text ?? '' : ''
}
const getAssignedOptionId = (taskId: string, rowId: string): string => assignments[makeKey(taskId, rowId)] ?? ''
const isAssigned = (taskId: string, rowId: string): boolean => Boolean(getAssignedOptionId(taskId, rowId))
const getCorrectText = (taskId: string, rowId: string): string => {
  const row = findRow(taskId, rowId)
  if (!row) return 'Перетащите ответ сюда'
  return findOption(taskId, row.correctOptionId)?.text ?? 'Перетащите ответ сюда'
}
const getDisplayedText = (taskId: string, rowId: string): string => {
  if (showAnswersMode.value) return getCorrectText(taskId, rowId)
  return getAssignedText(taskId, rowId) || 'Перетащите ответ сюда'
}
const isPlaceholder = (taskId: string, rowId: string): boolean =>
  !showAnswersMode.value && !getAssignedText(taskId, rowId)
const getDropzoneClass = (taskId: string, rowId: string): string => {
  if (showAnswersMode.value) return 'match-test__dropzone--correct'
  if (!checkMode.value) return ''
  if (!assignments[makeKey(taskId, rowId)]) return 'match-test__dropzone--incorrect'
  return isRowCorrect(taskId, rowId) ? 'match-test__dropzone--correct' : 'match-test__dropzone--incorrect'
}

const totalTasksCount = computed(() => props.tasks.length)
const isTaskCompleted = (taskId: string): boolean => {
  const task = findTask(taskId)
  if (!task) return false
  return task.rows.every((row) => Boolean(assignments[makeKey(taskId, row.id)]))
}
const isTaskCorrect = (taskId: string): boolean => {
  const task = findTask(taskId)
  if (!task) return false
  return task.rows.every((row) => isRowCorrect(taskId, row.id))
}
const completedTasksCount = computed(() =>
  props.tasks.reduce((acc, task) => (isTaskCompleted(task.id) ? acc + 1 : acc), 0),
)
const progressPercent = computed(() => {
  if (totalTasksCount.value === 0) return 0
  return Math.round((completedTasksCount.value / totalTasksCount.value) * 100)
})
const checkedTasksCount = computed(() => (checkMode.value ? totalTasksCount.value : 0))
const correctCheckedTasksCount = computed(() => {
  if (!checkMode.value) return 0
  return props.tasks.reduce((acc, task) => (isTaskCorrect(task.id) ? acc + 1 : acc), 0)
})
watch(
  [completedTasksCount, totalTasksCount, correctCheckedTasksCount, checkedTasksCount],
  ([completed, total, correctChecked, checked]) => {
    emit('progress-change', { completed, total, correctChecked, checked })
  },
  { immediate: true },
)

const checkAnswers = (): void => { checkMode.value = true }
const toggleComment = (taskId: string, rowId: string): void => {
  const key = makeKey(taskId, rowId)
  openCommentKey.value = openCommentKey.value === key ? '' : key
}
const showAnswers = (): void => {
  showAnswersMode.value = true
  openCommentKey.value = ''
}
const resetFeedback = (): void => {
  checkMode.value = false
  showAnswersMode.value = false
  openCommentKey.value = ''
}
const restartTest = (): void => {
  resetFeedback()
  Object.keys(assignments).forEach((k) => delete assignments[k])
  Object.keys(pendingOptionByTask).forEach((k) => delete pendingOptionByTask[k])
  clearTouchDragState()
  randomizeTaskOptionOrders()
}

const toBoolean = (value: unknown): boolean => value === true
const normalizeState = (state: unknown): MatchPairsState => {
  const raw = (state ?? {}) as Partial<MatchPairsState>
  const assignmentsByTask: Record<string, Record<string, string>> = {}
  props.tasks.forEach((task) => {
    assignmentsByTask[task.id] = {}
    const usedOptionIds = new Set<string>()
    task.rows.forEach((row) => {
      const rowKey = makeKey(task.id, row.id)
      const candidateOptionId = raw.assignments?.[rowKey]
      if (typeof candidateOptionId !== 'string') return
      const isOptionValid = task.options.some((option) => option.id === candidateOptionId)
      if (!isOptionValid || usedOptionIds.has(candidateOptionId)) return
      assignmentsByTask[task.id][row.id] = candidateOptionId
      usedOptionIds.add(candidateOptionId)
    })
  })
  const normalizedAssignments: Record<string, string> = {}
  Object.entries(assignmentsByTask).forEach(([taskId, rowMap]) => {
    Object.entries(rowMap).forEach(([rowId, optionId]) => {
      normalizedAssignments[makeKey(taskId, rowId)] = optionId
    })
  })
  return {
    assignments: normalizedAssignments,
    checkMode: toBoolean(raw.checkMode),
    showAnswersMode: toBoolean(raw.showAnswersMode),
  }
}
const applyState = (state: unknown): void => {
  const normalized = normalizeState(state)
  Object.keys(assignments).forEach((key) => delete assignments[key])
  Object.entries(normalized.assignments).forEach(([rowKey, optionId]) => {
    assignments[rowKey] = optionId
  })
  Object.keys(pendingOptionByTask).forEach((key) => delete pendingOptionByTask[key])
  checkMode.value = normalized.checkMode
  showAnswersMode.value = normalized.showAnswersMode
  openCommentKey.value = ''
}
const getState = (): MatchPairsState => normalizeState({
  assignments,
  checkMode: checkMode.value,
  showAnswersMode: showAnswersMode.value,
})
const setState = (state: unknown): void => {
  applyState(state)
}
watch(
  () => props.initialState,
  (state) => {
    if (!state) return
    applyState(state)
  },
  { immediate: true, deep: true },
)
watch(
  () => props.tasks,
  () => {
    validateTasksConfig()
    randomizeTaskOptionOrders()
    applyState(getState())
  },
  { immediate: true, deep: true },
)
watch(
  [assignments, checkMode, showAnswersMode],
  () => {
    emit('state-change', getState())
  },
  { immediate: true, deep: true },
)
defineExpose<StatefulTestComponentHandle<MatchPairsState>>({ getState, setState })
</script>

<style scoped>
.match-test {
  display: grid;
  gap: 1rem;
  max-width: 900px;
  color: var(--lt-color-text-primary, #111827);
}
.match-test__progress { display: grid; gap: 0.35rem; }
.match-test__progress-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; }
.match-test__progress-label { margin: 0; color: var(--lt-color-text-muted, #334155); }
.match-test__progress-stats { margin: 0; color: var(--lt-color-text-muted, #334155); }
.match-test__progress-track {
  width: 100%;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--lt-color-progress-track, #e5e7eb);
  overflow: hidden;
}
.match-test__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--lt-color-progress-fill, #2f6feb);
  transition: width 0.2s ease;
}
.match-test__description { color: var(--lt-color-text-secondary, #475569); margin-top: -0.35rem; }
:deep(.match-test__description p) { margin: 0.25rem 0; }
:deep(.match-test__description ul) { margin: 0.25rem 0; padding-left: 1.2rem; }
:deep(.match-test__description h3),
:deep(.match-test__description h4),
:deep(.match-test__description h5) { margin: 0.35rem 0; font-size: 0.95rem; }
.match-test__task {
  position: relative;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-card, 12px);
  padding: 1rem;
  background: var(--lt-color-card-bg, #fff);
}
.match-test__completed-mark {
  position: absolute;
  top: 0.6rem;
  right: 0.75rem;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  background: var(--lt-color-correct-strong, #1f9d42);
}
.match-test__table { width: 100%; border-collapse: collapse; }
.match-test__table th,
.match-test__table td { border: 1px solid var(--lt-color-table-border, #e5e7eb); padding: 0.6rem; }
.match-test__table th {
  background: var(--lt-color-table-header-bg, #f8fafc);
  color: var(--lt-color-text-primary, #111827);
  text-align: left;
}
.match-test__table td { color: var(--lt-color-text-primary, #111827); }
.match-test__dropzone {
  min-height: 40px;
  border: 1px dashed var(--lt-color-dropzone-border, #c5ccd8);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.4rem 0.5rem;
  display: flex;
  gap: 0.5rem;
  color: var(--lt-color-text-primary, #111827);
}
.match-test__dropzone--correct {
  background: var(--lt-color-correct-bg, #e8ffea);
  border-color: var(--lt-color-correct-border, #87d78b);
}
.match-test__dropzone--incorrect {
  background: var(--lt-color-incorrect-bg, #ffe9f1);
  border-color: var(--lt-color-incorrect-border, #f1a1be);
}
.match-test__dropzone--touch-ready {
  border-style: solid;
  border-color: var(--lt-color-primary, #2f6feb);
}
.match-test__dropzone--touch-target {
  border-style: solid;
  border-color: var(--lt-color-primary, #2f6feb);
  box-shadow: 0 0 0 2px rgba(47, 111, 235, 0.3);
  background: rgba(47, 111, 235, 0.08);
}
.match-test__chip--placeholder { color: var(--lt-color-placeholder, #9ca3af); font-style: italic; }
.match-test__chip--draggable { cursor: grab; }
.match-test__wrong-chip {
  color: var(--lt-color-incorrect-text, #9f1239);
  text-decoration: line-through;
  font-size: 0.88rem;
}
.match-test__bank { margin-top: 0.9rem; }
.match-test__answers { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.match-test__answer-chip {
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  cursor: grab;
}
.match-test__answer-chip--active {
  border-color: var(--lt-color-primary, #2f6feb);
  box-shadow: 0 0 0 1px var(--lt-color-primary, #2f6feb) inset;
}
.match-test__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.match-test__touch-preview {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 40;
  pointer-events: none;
  max-width: min(80vw, 20rem);
  border: 1px solid var(--lt-color-primary, #2f6feb);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.18);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.match-test__check-btn {
  border: 1px solid var(--lt-color-primary, #2f6feb);
  background: var(--lt-color-primary, #2f6feb);
  color: var(--lt-color-primary-contrast, #fff);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem 1rem;
}
.match-test__secondary-btn {
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem 1rem;
}
</style>
