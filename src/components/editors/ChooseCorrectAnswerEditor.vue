<template>
  <div class="choose-correct-editor">
    <section class="choose-correct-editor__section">
      <h4 class="choose-correct-editor__section-title">Описание (Markdown)</h4>
      <MarkdownEditor
        :model-value="descriptionMarkdown"
        placeholder="Инструкция для задания..."
        @update:model-value="onDescriptionChange"
      />
    </section>
    <section class="choose-correct-editor__section">
      <h4 class="choose-correct-editor__section-title">Основные атрибуты</h4>
      <label class="choose-correct-editor__field">
        <span class="choose-correct-editor__field-label">ID компонента</span>
        <input
          :value="componentId"
          class="choose-correct-editor__input"
          @input="onComponentIdInput(($event.target as HTMLInputElement).value)"
        />
      </label>
      <label class="choose-correct-editor__field">
        <span class="choose-correct-editor__field-label">Layout ответов</span>
        <select
          :value="answerLayout"
          class="choose-correct-editor__input"
          @change="onAnswerLayoutChange(($event.target as HTMLSelectElement).value)"
        >
          <option value="vertical">vertical</option>
          <option value="horizontal">horizontal</option>
          <option value="auto">auto</option>
        </select>
      </label>
    </section>

    <section class="choose-correct-editor__section">
      <div class="choose-correct-editor__questions-header">
        <h4 class="choose-correct-editor__section-title">Вопросы</h4>
        <el-button
          size="small"
          type="success"
          plain
          class="choose-correct-editor__question-add-button"
          @click="addQuestion"
        >
          + Добавить вопрос
        </el-button>
      </div>

      <el-collapse v-model="activeQuestionNames" class="choose-correct-editor__question-collapse">
        <el-collapse-item
          v-for="(question, index) in localQuestions"
          :key="`${question.id}-${index}`"
          :name="question.id"
          :class="{ 'choose-correct-editor__question-item--drag-over': draggedOverQuestionIndex === index }"
        >
          <template #title>
            <span
              class="choose-correct-editor__question-title-row"
              @dragenter.prevent="onQuestionDragOver(index)"
              @dragover.prevent
              @dragleave="onQuestionDragLeave(index, $event)"
              @drop.stop="onQuestionDrop(index)"
            >
              <span
                class="choose-correct-editor__drag-handle choose-correct-editor__drag-handle--question"
                title="Перетащите для изменения порядка"
                draggable="true"
                @click.stop
                @dragstart.stop="onQuestionDragStart(index, $event)"
                @dragend="onQuestionDragEnd"
              >
                ⋮⋮
              </span>
              <span class="choose-correct-editor__question-title">
                {{ getQuestionTitlePreview(question.text, index) }}
              </span>
              <span class="choose-correct-editor__question-actions">
                <el-button
                  size="small"
                  type="warning"
                  plain
                  class="choose-correct-editor__question-delete-button"
                  title="Удалить вопрос"
                  @click.stop="removeQuestion(index)"
                >
                  🗑
                </el-button>
              </span>
            </span>
          </template>

          <div class="choose-correct-editor__question-editor">
            <label class="choose-correct-editor__field">
              <span class="choose-correct-editor__field-label">ID вопроса</span>
              <input
                :value="question.id"
                class="choose-correct-editor__input"
                @input="onQuestionIdInput(index, ($event.target as HTMLInputElement).value)"
              />
            </label>

            <label class="choose-correct-editor__field">
              <span class="choose-correct-editor__field-label">Текст вопроса</span>
              <textarea
                :value="question.text"
                class="choose-correct-editor__textarea choose-correct-editor__textarea--question"
                spellcheck="false"
                @input="onQuestionTextInput(index, ($event.target as HTMLTextAreaElement).value)"
              />
            </label>

            <label class="choose-correct-editor__field choose-correct-editor__field--inline">
              <input
                type="checkbox"
                :checked="question.multiple"
                @change="onQuestionMultipleChange(index, ($event.target as HTMLInputElement).checked)"
              />
              <span class="choose-correct-editor__field-label">Множественный выбор</span>
            </label>

            <div class="choose-correct-editor__field">
              <div class="choose-correct-editor__answers-header">
                <span class="choose-correct-editor__field-label">Ответы</span>
                <el-button
                  size="small"
                  type="success"
                  plain
                  @click="addAnswer(index)"
                >
                  + Добавить ответ
                </el-button>
              </div>

              <div class="choose-correct-editor__answers-list">
                <div
                  v-for="(answer, answerIndex) in answerRowsByQuestionId[question.id] ?? []"
                  :key="`${question.id}-${answer.id}-${answerIndex}`"
                  class="choose-correct-editor__answer-row"
                  draggable="true"
                  @dragstart="onAnswerDragStart(question.id, answerIndex)"
                  @dragover.prevent
                  @drop="onAnswerDrop(question.id, answerIndex)"
                  @dragend="onAnswerDragEnd"
                >
                  <span class="choose-correct-editor__drag-handle" title="Перетащите для перемещения">
                    ⋮⋮
                  </span>
                  <input
                    :value="answer.id"
                    class="choose-correct-editor__input choose-correct-editor__input--answer-id"
                    placeholder="id"
                    @input="onAnswerIdInput(question.id, answerIndex, ($event.target as HTMLInputElement).value)"
                  />
                  <input
                    :value="answer.text"
                    class="choose-correct-editor__input choose-correct-editor__input--answer-text"
                    placeholder="Текст ответа"
                    @input="onAnswerTextInput(question.id, answerIndex, ($event.target as HTMLInputElement).value)"
                  />
                  <label class="choose-correct-editor__answer-correct">
                    <input
                      type="checkbox"
                      class="choose-correct-editor__answer-correct-checkbox"
                      :checked="answer.isCorrect"
                      @change="onAnswerCorrectChange(question.id, answerIndex, ($event.target as HTMLInputElement).checked)"
                    />
                    <span>Правильный</span>
                  </label>
                  <el-tooltip
                    placement="top"
                    :show-after="150"
                    :hide-after="0"
                    popper-class="choose-correct-editor__comment-tooltip"
                  >
                    <template #content>
                      <div
                        class="choose-correct-editor__comment-tooltip-content"
                        v-html="getAnswerCommentTooltipHtml(answer)"
                      />
                    </template>
                    <el-button
                      size="small"
                      plain
                      circle
                      class="choose-correct-editor__answer-comment-button"
                      :class="{ 'choose-correct-editor__answer-comment-button--active': hasAnswerComment(answer) }"
                      @click.stop="openAnswerCommentEditor(question.id, answerIndex)"
                    >
                      ?
                    </el-button>
                  </el-tooltip>
                  <el-button
                    size="small"
                    type="warning"
                    plain
                    class="choose-correct-editor__answer-delete-button"
                    title="Удалить ответ"
                    @click="removeAnswer(question.id, answerIndex)"
                  >
                    🗑
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </section>

    <el-dialog
      v-model="isCommentDialogOpen"
      title="Комментарий к ответу"
      width="760px"
      append-to-body
    >
      <MarkdownEditor
        :model-value="commentDraft"
        placeholder="Комментарий (Markdown)"
        @update:model-value="onCommentDraftChange"
      />
      <template #footer>
        <div class="choose-correct-editor__comment-dialog-actions">
          <el-button @click="closeAnswerCommentEditor">Отмена</el-button>
          <el-button type="primary" @click="saveAnswerComment">Сохранить</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import MarkdownEditor from '../MarkdownEditor.vue'
import type { ChooseCorrectAnswerConfig } from '../../types/test-config'
import type { TestOption, TestQuestion } from '../../types/component-contracts'
import { renderMarkdown } from '../../utils/markdown'
interface AnswerEditorRow {
  id: string
  text: string
  isCorrect: boolean
  commentMarkdown?: string
}

const props = defineProps<{
  modelValue: ChooseCorrectAnswerConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ChooseCorrectAnswerConfig): void
}>()

const descriptionMarkdown = ref(props.modelValue.descriptionMarkdown ?? '')
const componentId = ref(props.modelValue.id)
const answerLayout = ref(props.modelValue.answerLayout ?? 'vertical')
const localQuestions = ref<TestQuestion[]>([])
const activeQuestionNames = ref<string[]>([])
const answerRowsByQuestionId = reactive<Record<string, AnswerEditorRow[]>>({})
const draggedAnswer = ref<{ questionId: string, answerIndex: number } | null>(null)
const draggedQuestionIndex = ref<number | null>(null)
const draggedOverQuestionIndex = ref<number | null>(null)
const isCommentDialogOpen = ref(false)
const commentDraft = ref('')
const editedAnswerCommentRef = ref<{ questionId: string, answerIndex: number } | null>(null)

const cloneQuestions = (questions: TestQuestion[]): TestQuestion[] => JSON.parse(JSON.stringify(questions))
const genQuestionId = (): string => `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const genAnswerId = (): string => `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const QUESTION_TITLE_PREVIEW_MAX = 72

const getQuestionTitlePreview = (text: string | undefined, index: number): string => {
  const trimmed = text?.trim()
  if (!trimmed) return `Вопрос ${index + 1}`
  if (trimmed.length <= QUESTION_TITLE_PREVIEW_MAX) return trimmed
  return `${trimmed.slice(0, QUESTION_TITLE_PREVIEW_MAX).trimEnd()}...`
}

const clearMapKeys = <T>(record: Record<string, T>): void => {
  for (const key of Object.keys(record)) {
    delete record[key]
  }
}

const syncAnswerRows = (questions: TestQuestion[]): void => {
  clearMapKeys(answerRowsByQuestionId)
  for (const question of questions) {
    const correctIds = new Set(question.correctOptionIds ?? [])
    answerRowsByQuestionId[question.id] = (question.options ?? []).map((option) => ({
      id: option.id,
      text: option.text,
      commentMarkdown: option.commentMarkdown,
      isCorrect: correctIds.has(option.id),
    }))
  }
}

const syncFromProp = (): void => {
  descriptionMarkdown.value = props.modelValue.descriptionMarkdown ?? ''
  componentId.value = props.modelValue.id
  answerLayout.value = props.modelValue.answerLayout ?? 'vertical'
  localQuestions.value = cloneQuestions(props.modelValue.questions ?? [])
  activeQuestionNames.value = activeQuestionNames.value.filter((id) => localQuestions.value.some((q) => q.id === id))
  syncAnswerRows(localQuestions.value)
}

watch(() => props.modelValue, syncFromProp, { immediate: true, deep: true })

const emitWithQuestions = (questions: TestQuestion[]): void => {
  const preparedQuestions = questions.map((question) => {
    const rows = answerRowsByQuestionId[question.id] ?? []
    const options: TestOption[] = rows.map((row) => ({
      id: row.id,
      text: row.text,
      commentMarkdown: row.commentMarkdown,
    }))
    const correctOptionIds = rows.filter((row) => row.isCorrect).map((row) => row.id)
    return {
      ...question,
      options,
      correctOptionIds,
    }
  })
  emit('update:modelValue', {
    ...props.modelValue,
    id: componentId.value.trim() || props.modelValue.id,
    componentType: 'choose-correct-answer',
    answerLayout: answerLayout.value,
    answerLayoutHeuristics: props.modelValue.answerLayoutHeuristics,
    title: props.modelValue.title,
    descriptionMarkdown: descriptionMarkdown.value || undefined,
    questions: cloneQuestions(preparedQuestions),
  })
}

const setQuestionsAndEmit = (nextQuestions: TestQuestion[]): void => {
  localQuestions.value = nextQuestions
  emitWithQuestions(nextQuestions)
}

const onDescriptionChange = (v: string): void => {
  descriptionMarkdown.value = v
  emitWithQuestions(localQuestions.value)
}

const onComponentIdInput = (value: string): void => {
  componentId.value = value
  emitWithQuestions(localQuestions.value)
}

const onAnswerLayoutChange = (value: string): void => {
  if (value === 'vertical' || value === 'horizontal' || value === 'auto') {
    answerLayout.value = value
    emitWithQuestions(localQuestions.value)
  }
}

const migrateQuestionMaps = (oldId: string, newId: string): void => {
  if (oldId === newId) return
  if (answerRowsByQuestionId[oldId] !== undefined) {
    answerRowsByQuestionId[newId] = answerRowsByQuestionId[oldId]
    delete answerRowsByQuestionId[oldId]
  }
  activeQuestionNames.value = activeQuestionNames.value.map((name) => (name === oldId ? newId : name))
}

const onQuestionIdInput = (index: number, value: string): void => {
  const oldId = localQuestions.value[index]?.id
  if (!oldId) return
  const nextId = value.trim() || oldId
  const nextQuestions = cloneQuestions(localQuestions.value)
  nextQuestions[index] = { ...nextQuestions[index], id: nextId }
  migrateQuestionMaps(oldId, nextId)
  setQuestionsAndEmit(nextQuestions)
}

const onQuestionTextInput = (index: number, value: string): void => {
  const nextQuestions = cloneQuestions(localQuestions.value)
  if (!nextQuestions[index]) return
  nextQuestions[index] = { ...nextQuestions[index], text: value }
  setQuestionsAndEmit(nextQuestions)
}

const normalizeSingleChoiceRows = (
  rows: AnswerEditorRow[],
  preferredIndex?: number,
): AnswerEditorRow[] => {
  if (rows.length === 0) return rows
  const checkedIndexes = rows
    .map((row, idx) => (row.isCorrect ? idx : -1))
    .filter((idx) => idx >= 0)
  let keepIndex = checkedIndexes[0] ?? 0
  if (preferredIndex !== undefined && preferredIndex >= 0 && preferredIndex < rows.length) {
    keepIndex = preferredIndex
  }
  return rows.map((row, idx) => ({ ...row, isCorrect: idx === keepIndex }))
}

const onQuestionMultipleChange = (index: number, value: boolean): void => {
  const nextQuestions = cloneQuestions(localQuestions.value)
  const question = nextQuestions[index]
  if (!question) return
  nextQuestions[index] = { ...question, multiple: value }
  localQuestions.value = nextQuestions
  if (!value) {
    const rows = [...(answerRowsByQuestionId[question.id] ?? [])]
    answerRowsByQuestionId[question.id] = normalizeSingleChoiceRows(rows)
  }
  emitWithQuestions(nextQuestions)
}

const addQuestion = (): void => {
  const id = genQuestionId()
  const nextQuestion: TestQuestion = {
    id,
    text: '',
    multiple: false,
    options: [],
    correctOptionIds: [],
  }
  const nextQuestions = [...cloneQuestions(localQuestions.value), nextQuestion]
  answerRowsByQuestionId[id] = []
  activeQuestionNames.value = [...activeQuestionNames.value, id]
  setQuestionsAndEmit(nextQuestions)
}

const removeQuestion = (index: number): void => {
  const removed = localQuestions.value[index]
  if (!removed) return
  const nextQuestions = cloneQuestions(localQuestions.value)
  nextQuestions.splice(index, 1)
  delete answerRowsByQuestionId[removed.id]
  activeQuestionNames.value = activeQuestionNames.value.filter((name) => name !== removed.id)
  setQuestionsAndEmit(nextQuestions)
}

const onQuestionDragStart = (index: number, event: DragEvent): void => {
  draggedQuestionIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const onQuestionDragOver = (index: number): void => {
  if (draggedQuestionIndex.value === null) return
  draggedOverQuestionIndex.value = index
}

const onQuestionDragLeave = (index: number, event: DragEvent): void => {
  const currentTarget = event.currentTarget as HTMLElement | null
  const relatedTarget = event.relatedTarget as Node | null
  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) return
  if (draggedOverQuestionIndex.value === index) {
    draggedOverQuestionIndex.value = null
  }
}

const onQuestionDrop = (targetIndex: number): void => {
  const sourceIndex = draggedQuestionIndex.value
  draggedOverQuestionIndex.value = null
  if (sourceIndex === null || sourceIndex === targetIndex) return
  if (sourceIndex < 0 || sourceIndex >= localQuestions.value.length) return
  const nextQuestions = cloneQuestions(localQuestions.value)
  const [moved] = nextQuestions.splice(sourceIndex, 1)
  nextQuestions.splice(targetIndex, 0, moved)
  setQuestionsAndEmit(nextQuestions)
}

const onQuestionDragEnd = (): void => {
  draggedQuestionIndex.value = null
  draggedOverQuestionIndex.value = null
}

const addAnswer = (questionIndex: number): void => {
  const question = localQuestions.value[questionIndex]
  if (!question) return
  let nextRows = [...(answerRowsByQuestionId[question.id] ?? []), {
    id: genAnswerId(),
    text: '',
    isCorrect: false,
  }]
  if (!question.multiple) {
    nextRows = normalizeSingleChoiceRows(nextRows)
  }
  answerRowsByQuestionId[question.id] = nextRows
  emitWithQuestions(localQuestions.value)
}

const removeAnswer = (questionId: string, answerIndex: number): void => {
  const rows = [...(answerRowsByQuestionId[questionId] ?? [])]
  if (answerIndex < 0 || answerIndex >= rows.length) return
  const question = localQuestions.value.find((q) => q.id === questionId)
  rows.splice(answerIndex, 1)
  answerRowsByQuestionId[questionId] = question && !question.multiple
    ? normalizeSingleChoiceRows(rows)
    : rows
  emitWithQuestions(localQuestions.value)
}

const onAnswerIdInput = (questionId: string, answerIndex: number, value: string): void => {
  const rows = [...(answerRowsByQuestionId[questionId] ?? [])]
  if (!rows[answerIndex]) return
  rows[answerIndex] = { ...rows[answerIndex], id: value.trim() || rows[answerIndex].id }
  answerRowsByQuestionId[questionId] = rows
  emitWithQuestions(localQuestions.value)
}

const onAnswerTextInput = (questionId: string, answerIndex: number, value: string): void => {
  const rows = [...(answerRowsByQuestionId[questionId] ?? [])]
  if (!rows[answerIndex]) return
  rows[answerIndex] = { ...rows[answerIndex], text: value }
  answerRowsByQuestionId[questionId] = rows
  emitWithQuestions(localQuestions.value)
}

const onAnswerCorrectChange = (questionId: string, answerIndex: number, checked: boolean): void => {
  let rows = [...(answerRowsByQuestionId[questionId] ?? [])]
  if (!rows[answerIndex]) return
  const question = localQuestions.value.find((q) => q.id === questionId)
  if (question && !question.multiple) {
    rows = normalizeSingleChoiceRows(rows, checked ? answerIndex : undefined)
  } else {
    rows[answerIndex] = { ...rows[answerIndex], isCorrect: checked }
  }
  answerRowsByQuestionId[questionId] = rows
  emitWithQuestions(localQuestions.value)
}

const onAnswerDragStart = (questionId: string, answerIndex: number): void => {
  draggedAnswer.value = { questionId, answerIndex }
}

const onAnswerDrop = (questionId: string, targetIndex: number): void => {
  const drag = draggedAnswer.value
  if (!drag || drag.questionId !== questionId) return
  const rows = [...(answerRowsByQuestionId[questionId] ?? [])]
  if (drag.answerIndex < 0 || drag.answerIndex >= rows.length) return
  const [moved] = rows.splice(drag.answerIndex, 1)
  rows.splice(targetIndex, 0, moved)
  answerRowsByQuestionId[questionId] = rows
  draggedAnswer.value = null
  emitWithQuestions(localQuestions.value)
}

const onAnswerDragEnd = (): void => {
  draggedAnswer.value = null
}

const hasAnswerComment = (answer: AnswerEditorRow): boolean => Boolean(answer.commentMarkdown?.trim())
const getAnswerCommentTooltipHtml = (answer: AnswerEditorRow): string => {
  if (!hasAnswerComment(answer)) return 'Комментарий не задан'
  return renderMarkdown(answer.commentMarkdown ?? '')
}

const openAnswerCommentEditor = (questionId: string, answerIndex: number): void => {
  const rows = answerRowsByQuestionId[questionId] ?? []
  const answer = rows[answerIndex]
  if (!answer) return
  editedAnswerCommentRef.value = { questionId, answerIndex }
  commentDraft.value = answer.commentMarkdown ?? ''
  isCommentDialogOpen.value = true
}

const closeAnswerCommentEditor = (): void => {
  isCommentDialogOpen.value = false
  editedAnswerCommentRef.value = null
  commentDraft.value = ''
}

const onCommentDraftChange = (value: string): void => {
  commentDraft.value = value
}

const saveAnswerComment = (): void => {
  const target = editedAnswerCommentRef.value
  if (!target) {
    closeAnswerCommentEditor()
    return
  }
  const rows = [...(answerRowsByQuestionId[target.questionId] ?? [])]
  const answer = rows[target.answerIndex]
  if (!answer) {
    closeAnswerCommentEditor()
    return
  }
  const normalized = commentDraft.value.trim()
  rows[target.answerIndex] = {
    ...answer,
    commentMarkdown: normalized ? commentDraft.value : undefined,
  }
  answerRowsByQuestionId[target.questionId] = rows
  emitWithQuestions(localQuestions.value)
  closeAnswerCommentEditor()
}
</script>

<style scoped>
.choose-correct-editor {
  display: grid;
  gap: 1rem;
}

.choose-correct-editor__section-title {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--lt-color-text-muted, #334155);
}

.choose-correct-editor__section {
  display: grid;
}

.choose-correct-editor__questions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.choose-correct-editor__question-add-button {
  flex-shrink: 0;
}

.choose-correct-editor__question-collapse {
  margin-left: 1rem;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-card, 10px);
  padding: 0.35rem;
  background: var(--lt-color-secondary-bg, #f8fafc);
}

.choose-correct-editor__question-collapse :deep(.el-collapse-item) {
  margin-bottom: 0.4rem;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-control, 8px);
  overflow: hidden;
}

.choose-correct-editor__question-collapse :deep(.el-collapse-item:last-child) {
  margin-bottom: 0;
}

.choose-correct-editor__question-collapse :deep(.el-collapse-item__header) {
  background: var(--lt-color-card-bg, #ffffff);
  padding-left: 0.55rem;
}

.choose-correct-editor__question-item--drag-over :deep(.el-collapse-item__header) {
  background: color-mix(in srgb, var(--lt-color-primary, #2f6feb) 10%, #ffffff);
}

.choose-correct-editor__question-collapse :deep(.el-collapse-item__wrap),
.choose-correct-editor__question-collapse :deep(.el-collapse-item__content) {
  background: var(--lt-color-card-bg, #ffffff);
}

.choose-correct-editor__question-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  gap: 0.5rem;
  padding-right: 0.35rem;
  overflow: hidden;
}

.choose-correct-editor__question-title {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--lt-color-text-primary, #111827);
  line-height: 1.25;
  position: relative;
  padding-right: 1.6rem;
}

.choose-correct-editor__question-title::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1.4rem;
  height: 100%;
  pointer-events: none;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0),
    var(--lt-color-card-bg, #ffffff) 85%
  );
}

.choose-correct-editor__question-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.25rem;
  margin-right: 1.35rem;
}

.choose-correct-editor__question-delete-button {
  font-size: 0.88rem;
  line-height: 1;
  padding-left: 0.35rem;
  padding-right: 0.35rem;
}

.choose-correct-editor__answer-delete-button {
  font-size: 0.82rem;
  line-height: 1;
  padding-left: 0.3rem;
  padding-right: 0.3rem;
}

.choose-correct-editor__answer-comment-button {
  font-weight: 700;
  color: var(--lt-color-text-muted, #64748b);
  border-color: var(--lt-color-input-border, #cbd5e1);
}

.choose-correct-editor__answer-comment-button--active {
  color: var(--lt-color-primary, #2f6feb);
  border-color: color-mix(in srgb, var(--lt-color-primary, #2f6feb) 55%, #ffffff);
  background: color-mix(in srgb, var(--lt-color-primary, #2f6feb) 10%, #ffffff);
}

.choose-correct-editor__question-editor {
  display: grid;
  gap: 0.75rem;
  padding: 0.4rem 0.75rem 0.75rem;
}

.choose-correct-editor__field {
  display: grid;
  gap: 0.35rem;
}

.choose-correct-editor__field--inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.choose-correct-editor__field-label {
  font-size: 0.82rem;
  color: var(--lt-color-text-muted, #334155);
}

.choose-correct-editor__answers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.choose-correct-editor__answers-list {
  display: grid;
  gap: 0.5rem;
}

.choose-correct-editor__answer-row {
  display: grid;
  grid-template-columns: auto minmax(140px, 180px) minmax(200px, 1fr) auto auto auto;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem;
  background: var(--lt-color-card-bg, #fff);
}

.choose-correct-editor__drag-handle {
  user-select: none;
  cursor: grab;
  font-size: 1rem;
  color: var(--lt-color-text-muted, #64748b);
  line-height: 1;
}

.choose-correct-editor__drag-handle--question {
  flex-shrink: 0;
}

.choose-correct-editor__answer-row:active .choose-correct-editor__drag-handle {
  cursor: grabbing;
}

.choose-correct-editor__answer-correct {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  font-size: 0.82rem;
  color: var(--lt-color-text-muted, #334155);
}

.choose-correct-editor__input {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--lt-color-input-border, #9ca3af);
  border-radius: var(--lt-radius-control, 8px);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-field-text, #111827);
  font-size: 0.9rem;
}

.choose-correct-editor__input:focus {
  outline: none;
  border-color: var(--lt-color-primary, #2f6feb);
}

.choose-correct-editor__input--answer-id {
  min-width: 0;
}

.choose-correct-editor__input--answer-text {
  min-width: 0;
}

.choose-correct-editor__textarea {
  width: 100%;
  min-height: 160px;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--lt-color-input-border, #9ca3af);
  border-radius: var(--lt-radius-control, 8px);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-field-text, #111827);
  resize: vertical;
}

.choose-correct-editor__textarea--question {
  min-height: 96px;
}

.choose-correct-editor__textarea--question-json {
  min-height: 120px;
}

.choose-correct-editor__textarea--error {
  border-color: var(--lt-color-incorrect-border, #f1a1be);
}

.choose-correct-editor__error {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--lt-color-incorrect-text, #9f1239);
}

.choose-correct-editor__comment-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

:deep(.choose-correct-editor__comment-tooltip) {
  max-width: 420px;
}

.choose-correct-editor__comment-tooltip-content {
  font-size: 0.82rem;
  line-height: 1.35;
}

.choose-correct-editor__comment-tooltip-content :deep(p) {
  margin: 0;
}
</style>
