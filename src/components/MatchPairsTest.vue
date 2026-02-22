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
                <span class="match-test__chip" :class="{ 'match-test__chip--placeholder': isPlaceholder(task.id, row.id) }">
                  {{ getDisplayedText(task.id, row.id) }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="match-test__bank">
        <p class="match-test__bank-title">Ответы:</p>
        <div class="match-test__answers">
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
            @touchend.prevent="onAnswerTouchEnd($event)"
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
import { renderMarkdown } from '../utils/markdown'
export interface MatchOption { id: string; text: string }
export interface MatchRow { id: string; prompt: string; correctOptionId: string }
export interface MatchTask {
  id: string
  title?: string
  leftColumnTitle?: string
  rightColumnTitle?: string
  rows: MatchRow[]
  options: MatchOption[]
}
interface Props { title?: string; descriptionMarkdown?: string; tasks: MatchTask[] }

const props = withDefaults(defineProps<Props>(), { title: 'Сопоставь одно с другим' })
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''))
const assignments = reactive<Record<string, string>>({})
const pendingOptionByTask = reactive<Record<string, string>>({})
const draggingTaskId = ref('')
const draggingOptionId = ref('')
const checkMode = ref(false)
const showAnswersMode = ref(false)

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
const assignOptionToRow = (taskId: string, rowId: string, optionId: string): void => {
  checkMode.value = false
  showAnswersMode.value = false
  const task = findTask(taskId)
  if (!task) return
  task.rows.forEach((row) => {
    if (assignments[makeKey(taskId, row.id)] === optionId) delete assignments[makeKey(taskId, row.id)]
  })
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
  event.dataTransfer?.setData('text/plain', `${taskId}::${optionId}`)
}
const onRowDrop = (taskId: string, rowId: string, event: DragEvent): void => {
  const payload = event.dataTransfer?.getData('text/plain') ?? ''
  const [payloadTaskId, payloadOptionId] = payload.split('::')
  const sourceTaskId = payloadTaskId || draggingTaskId.value
  const optionId = payloadOptionId || draggingOptionId.value
  if (sourceTaskId === taskId && optionId) assignOptionToRow(taskId, rowId, optionId)
}
const onAnswerTouchStart = (taskId: string, optionId: string): void => {
  draggingTaskId.value = taskId
  draggingOptionId.value = optionId
}
const onAnswerTouchEnd = (event: TouchEvent): void => {
  const touch = event.changedTouches[0]
  if (!touch) return
  const target = document.elementFromPoint(touch.clientX, touch.clientY)
  const dropzone = target?.closest('.match-test__dropzone') as HTMLElement | null
  if (!dropzone) return
  const taskId = dropzone.dataset.taskId ?? ''
  const rowId = dropzone.dataset.rowId ?? ''
  if (taskId && rowId && taskId === draggingTaskId.value) assignOptionToRow(taskId, rowId, draggingOptionId.value)
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
const showAnswers = (): void => { showAnswersMode.value = true }
const resetFeedback = (): void => { checkMode.value = false; showAnswersMode.value = false }
const restartTest = (): void => {
  resetFeedback()
  Object.keys(assignments).forEach((k) => delete assignments[k])
  Object.keys(pendingOptionByTask).forEach((k) => delete pendingOptionByTask[k])
}
</script>

<style scoped>
.match-test { display: grid; gap: 1rem; max-width: 900px; }
.match-test__stats { margin: -0.25rem 0 0; color: #334155; }
.match-test__description { color: #475569; margin-top: -0.35rem; }
:deep(.match-test__description p) { margin: 0.25rem 0; }
:deep(.match-test__description ul) { margin: 0.25rem 0; padding-left: 1.2rem; }
:deep(.match-test__description h3),
:deep(.match-test__description h4),
:deep(.match-test__description h5) { margin: 0.35rem 0; font-size: 0.95rem; }
.match-test__task { border: 1px solid #d7d7d7; border-radius: 12px; padding: 1rem; background: #fff; }
.match-test__table { width: 100%; border-collapse: collapse; }
.match-test__table th, .match-test__table td { border: 1px solid #e5e7eb; padding: 0.6rem; }
.match-test__table th { background: #f8fafc; text-align: left; }
.match-test__dropzone { min-height: 40px; border: 1px dashed #c5ccd8; border-radius: 8px; padding: 0.4rem 0.5rem; display: flex; gap: 0.5rem; }
.match-test__dropzone--correct { background: #e8ffea; border-color: #87d78b; }
.match-test__dropzone--incorrect { background: #ffe9f1; border-color: #f1a1be; }
.match-test__chip--placeholder { color: #9ca3af; font-style: italic; }
.match-test__wrong-chip { color: #9f1239; text-decoration: line-through; font-size: 0.88rem; }
.match-test__bank { margin-top: 0.9rem; }
.match-test__answers { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.match-test__answer-chip { border: 1px solid #d1d5db; background: #fff; border-radius: 999px; padding: 0.35rem 0.75rem; cursor: grab; }
.match-test__answer-chip--active { border-color: #2f6feb; box-shadow: 0 0 0 1px #2f6feb inset; }
.match-test__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.match-test__check-btn { border: 1px solid #2f6feb; background: #2f6feb; color: #fff; border-radius: 8px; padding: 0.5rem 1rem; }
.match-test__secondary-btn { border: 1px solid #d1d5db; background: #fff; color: #111827; border-radius: 8px; padding: 0.5rem 1rem; }
</style>
