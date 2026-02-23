<template>
  <section class="match-test">
    <h2>{{ title }}</h2>
    <div v-if="descriptionMarkdown" class="match-test__description" v-html="renderedDescription"></div>
    <p v-if="checkMode" class="match-test__stats">Правильно: {{ correctRowsCount }} из {{ totalRowsCount }}</p>

    <article v-for="task in tasks" :key="task.id" class="match-test__task">
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
                :class="getDropzoneClass(task.id, row.id)"
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
            @touchend.prevent="onTouchEnd($event)"
          >
            {{ option.text }}
          </button>
        </div>
      </div>
    </article>

    <div class="match-test__actions">
      <button class="match-test__check-btn" type="button" @click="checkAnswers">Проверить</button>
      <button class="match-test__secondary-btn" type="button" @click="showAnswers">Показать правильные ответы</button>
      <button class="match-test__secondary-btn" type="button" @click="resetFeedback">Сброс</button>
      <button class="match-test__secondary-btn" type="button" @click="restartTest">Начать заново</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AnswerCommentPopover from './AnswerCommentPopover.vue'
import { renderMarkdown } from '../utils/markdown'
import type { MatchOption, MatchRow, MatchTask } from '../types/component-contracts'

interface Props { title?: string; descriptionMarkdown?: string; tasks: MatchTask[] }

const props = withDefaults(defineProps<Props>(), { title: 'Сопоставь одно с другим' })
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''))
const assignments = reactive<Record<string, string>>({})
const pendingOptionByTask = reactive<Record<string, string>>({})
const draggingTaskId = ref('')
const draggingOptionId = ref('')
const checkMode = ref(false)
const showAnswersMode = ref(false)
const openCommentKey = ref('')

const makeKey = (taskId: string, rowId: string): string => `${taskId}::${rowId}`
const findTask = (taskId: string): MatchTask | undefined => props.tasks.find((t) => t.id === taskId)
const findRow = (taskId: string, rowId: string): MatchRow | undefined =>
  findTask(taskId)?.rows.find((r) => r.id === rowId)
const findOption = (taskId: string, optionId: string): MatchOption | undefined =>
  findTask(taskId)?.options.find((o) => o.id === optionId)

const getPendingOption = (taskId: string): string => pendingOptionByTask[taskId] ?? ''
const getAvailableOptions = (taskId: string): MatchOption[] => {
  const task = findTask(taskId)
  if (!task) return []
  const assigned = new Set(task.rows.map((r) => assignments[makeKey(taskId, r.id)]).filter(Boolean))
  return task.options.filter((o) => !assigned.has(o.id))
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
}
const onAssignedTouchStart = (taskId: string, rowId: string): void => {
  const optionId = getAssignedOptionId(taskId, rowId)
  if (!optionId) return
  draggingTaskId.value = taskId
  draggingOptionId.value = optionId
}
const onTouchEnd = (event: TouchEvent): void => {
  const touch = event.changedTouches[0]
  if (!touch) return
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
}

const isRowCorrect = (taskId: string, rowId: string): boolean => {
  const row = findRow(taskId, rowId)
  return !!row && assignments[makeKey(taskId, rowId)] === row.correctOptionId
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

const totalRowsCount = computed(() => props.tasks.reduce((acc, t) => acc + t.rows.length, 0))
const correctRowsCount = computed(() =>
  props.tasks.reduce((acc, t) => acc + t.rows.reduce((rAcc, r) => (isRowCorrect(t.id, r.id) ? rAcc + 1 : rAcc), 0), 0),
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
}
</script>

<style scoped>
.match-test {
  display: grid;
  gap: 1rem;
  max-width: 900px;
  color: var(--lt-color-text-primary, #111827);
}
.match-test__stats { margin: -0.25rem 0 0; color: var(--lt-color-text-muted, #334155); }
.match-test__description { color: var(--lt-color-text-secondary, #475569); margin-top: -0.35rem; }
:deep(.match-test__description p) { margin: 0.25rem 0; }
:deep(.match-test__description ul) { margin: 0.25rem 0; padding-left: 1.2rem; }
:deep(.match-test__description h3),
:deep(.match-test__description h4),
:deep(.match-test__description h5) { margin: 0.35rem 0; font-size: 0.95rem; }
.match-test__task {
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-card, 12px);
  padding: 1rem;
  background: var(--lt-color-card-bg, #fff);
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
