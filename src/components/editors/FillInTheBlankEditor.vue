<template>
  <div class="fill-editor">
    <section class="fill-editor__section">
      <h4 class="fill-editor__section-title">Описание (Markdown)</h4>
      <MarkdownEditor
        :model-value="descriptionMarkdown"
        placeholder="Инструкция для задания..."
        @update:model-value="onDescriptionChange"
      />
    </section>

    <section class="fill-editor__section">
      <h4 class="fill-editor__section-title">Основные атрибуты</h4>
      <label class="fill-editor__field">
        <span class="fill-editor__field-label">ID компонента</span>
        <input
          :value="componentId"
          class="fill-editor__input"
          @input="onComponentIdInput(($event.target as HTMLInputElement).value)"
        />
      </label>
    </section>

    <section class="fill-editor__section">
      <div class="fill-editor__texts-header">
        <h4 class="fill-editor__section-title">Тексты</h4>
        <el-button size="small" type="success" plain @click="addText">+ Добавить текст</el-button>
      </div>

      <el-collapse v-model="activeTextNames" class="fill-editor__text-collapse">
        <el-collapse-item
          v-for="(textItem, textIndex) in localTexts"
          :key="`${textItem.id}-${textIndex}`"
          :name="textItem.id"
          :class="{ 'fill-editor__text-item--drag-over': draggedOverTextIndex === textIndex }"
        >
          <template #title>
            <span
              class="fill-editor__text-title-row"
              @dragenter.prevent="onTextDragOver(textIndex)"
              @dragover.prevent
              @dragleave="onTextDragLeave(textIndex, $event)"
              @drop.stop="onTextDrop(textIndex)"
            >
              <span
                class="fill-editor__drag-handle fill-editor__drag-handle--text"
                draggable="true"
                title="Перетащите для изменения порядка"
                @click.stop
                @dragstart.stop="onTextDragStart(textIndex, $event)"
                @dragend="onTextDragEnd"
              >
                ⋮⋮
              </span>
              <span class="fill-editor__text-title">{{ getTextTitlePreview(textItem, textIndex) }}</span>
              <span class="fill-editor__text-actions">
                <el-button
                  size="small"
                  type="warning"
                  plain
                  class="fill-editor__delete-button"
                  title="Удалить текст"
                  @click.stop="removeText(textIndex)"
                >
                  🗑
                </el-button>
              </span>
            </span>
          </template>

          <div class="fill-editor__text-editor">
            <label class="fill-editor__field">
              <span class="fill-editor__field-label">ID текста</span>
              <input
                :value="textItem.id"
                class="fill-editor__input"
                @input="onTextIdInput(textIndex, ($event.target as HTMLInputElement).value)"
              />
            </label>

            <label class="fill-editor__field">
              <span class="fill-editor__field-label">Заголовок текста</span>
              <input
                :value="textItem.title ?? ''"
                class="fill-editor__input"
                @input="onTextTitleInput(textIndex, ($event.target as HTMLInputElement).value)"
              />
            </label>

            <label class="fill-editor__field">
              <span class="fill-editor__field-label">Контент (используйте маркеры вида [[blank-id]])</span>
              <textarea
                :value="textItem.content"
                class="fill-editor__textarea"
                spellcheck="false"
                @input="onTextContentInput(textIndex, ($event.target as HTMLTextAreaElement).value)"
              />
            </label>

            <p v-if="getBlankSyncWarning(textItem)" class="fill-editor__warning">
              {{ getBlankSyncWarning(textItem) }}
            </p>

            <div class="fill-editor__field">
              <div class="fill-editor__blanks-header">
                <span class="fill-editor__field-label">Пропуски</span>
                <el-button size="small" type="success" plain @click="addBlank(textIndex)">
                  + Добавить пропуск
                </el-button>
              </div>

              <div class="fill-editor__blanks-list">
                <div
                  v-for="(blank, blankIndex) in textItem.blanks"
                  :key="`${textItem.id}-${blank.id}-${blankIndex}`"
                  class="fill-editor__blank-row"
                >
                  <input
                    :value="blank.id"
                    class="fill-editor__input fill-editor__input--blank-id"
                    placeholder="id"
                    @input="onBlankIdInput(textIndex, blankIndex, ($event.target as HTMLInputElement).value)"
                  />

                  <div class="fill-editor__answers-editor">
                    <span class="fill-editor__answers-label">Правильные ответы</span>
                    <div class="fill-editor__answers-list">
                      <div
                        v-for="(answer, answerIndex) in blank.correctAnswers"
                        :key="`${textItem.id}-${blank.id}-${answerIndex}`"
                        class="fill-editor__answer-row"
                      >
                        <input
                          :value="answer"
                          class="fill-editor__input"
                          placeholder="Вариант ответа"
                          @input="onCorrectAnswerInput(
                            textIndex,
                            blankIndex,
                            answerIndex,
                            ($event.target as HTMLInputElement).value
                          )"
                        />
                        <el-button
                          size="small"
                          type="warning"
                          plain
                          class="fill-editor__delete-button"
                          title="Удалить вариант ответа"
                          @click="removeCorrectAnswer(textIndex, blankIndex, answerIndex)"
                        >
                          🗑
                        </el-button>
                      </div>
                    </div>
                    <el-button
                      size="small"
                      plain
                      class="fill-editor__add-answer-button"
                      @click="addCorrectAnswer(textIndex, blankIndex)"
                    >
                      + Вариант ответа
                    </el-button>
                  </div>

                  <el-tooltip
                    placement="top"
                    :show-after="150"
                    :hide-after="0"
                    popper-class="fill-editor__comment-tooltip"
                  >
                    <template #content>
                      <div class="fill-editor__comment-tooltip-content" v-html="getBlankCommentTooltipHtml(blank)" />
                    </template>
                    <el-button
                      size="small"
                      plain
                      circle
                      class="fill-editor__comment-button"
                      :class="{ 'fill-editor__comment-button--active': hasBlankComment(blank) }"
                      @click.stop="openBlankCommentEditor(textItem.id, blankIndex)"
                    >
                      ?
                    </el-button>
                  </el-tooltip>

                  <el-button
                    size="small"
                    type="warning"
                    plain
                    class="fill-editor__delete-button"
                    title="Удалить пропуск"
                    @click="removeBlank(textIndex, blankIndex)"
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
      title="Комментарий к пропуску"
      width="760px"
      append-to-body
    >
      <MarkdownEditor
        :model-value="commentDraft"
        placeholder="Комментарий (Markdown)"
        @update:model-value="onCommentDraftChange"
      />
      <template #footer>
        <div class="fill-editor__comment-dialog-actions">
          <el-button @click="closeBlankCommentEditor">Отмена</el-button>
          <el-button type="primary" @click="saveBlankComment">Сохранить</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MarkdownEditor from '../MarkdownEditor.vue'
import type { FillBlankConfig, FillTextTask } from '../../types/component-contracts'
import type { FillInTheBlankConfig } from '../../types/test-config'
import { renderMarkdown } from '../../utils/markdown'

const props = defineProps<{
  modelValue: FillInTheBlankConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FillInTheBlankConfig): void
}>()

const descriptionMarkdown = ref(props.modelValue.descriptionMarkdown ?? '')
const componentId = ref(props.modelValue.id)
const localTexts = ref<FillTextTask[]>([])
const activeTextNames = ref<string[]>([])
const draggedTextIndex = ref<number | null>(null)
const draggedOverTextIndex = ref<number | null>(null)
const isCommentDialogOpen = ref(false)
const commentDraft = ref('')
const editedBlankCommentRef = ref<{ textId: string, blankIndex: number } | null>(null)

const cloneTexts = (texts: FillTextTask[]): FillTextTask[] => JSON.parse(JSON.stringify(texts))
const genTextId = (): string => `txt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const genBlankId = (): string => `blank-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const TITLE_PREVIEW_MAX = 72

const syncFromProp = (): void => {
  descriptionMarkdown.value = props.modelValue.descriptionMarkdown ?? ''
  componentId.value = props.modelValue.id
  localTexts.value = cloneTexts(props.modelValue.texts ?? [])
  activeTextNames.value = activeTextNames.value.filter((id) => localTexts.value.some((text) => text.id === id))
}

watch(() => props.modelValue, syncFromProp, { immediate: true, deep: true })

const normalizeBlank = (blank: FillBlankConfig): FillBlankConfig => {
  const normalizedAnswers = [...(blank.correctAnswers ?? [])]
  if (normalizedAnswers.length === 0) {
    normalizedAnswers.push('')
  }
  return {
    ...blank,
    correctAnswers: normalizedAnswers,
    commentMarkdown: blank.commentMarkdown?.trim() ? blank.commentMarkdown : undefined,
  }
}

const emitWithTexts = (texts: FillTextTask[]): void => {
  const preparedTexts = texts.map((text) => ({
    ...text,
    title: text.title?.trim() ? text.title : undefined,
    blanks: (text.blanks ?? []).map(normalizeBlank),
  }))
  emit('update:modelValue', {
    ...props.modelValue,
    id: componentId.value.trim() || props.modelValue.id,
    componentType: 'fill-in-the-blank',
    title: props.modelValue.title,
    descriptionMarkdown: descriptionMarkdown.value || undefined,
    texts: cloneTexts(preparedTexts),
  })
}

const setTextsAndEmit = (nextTexts: FillTextTask[]): void => {
  localTexts.value = nextTexts
  emitWithTexts(nextTexts)
}

const onDescriptionChange = (value: string): void => {
  descriptionMarkdown.value = value
  emitWithTexts(localTexts.value)
}

const onComponentIdInput = (value: string): void => {
  componentId.value = value
  emitWithTexts(localTexts.value)
}

const getTextTitlePreview = (textItem: FillTextTask, index: number): string => {
  const base = textItem.title?.trim() || textItem.content?.trim() || `Текст ${index + 1}`
  if (base.length <= TITLE_PREVIEW_MAX) return base
  return `${base.slice(0, TITLE_PREVIEW_MAX).trimEnd()}...`
}

const parseBlankIdsFromContent = (content: string): string[] => {
  const matches = content.match(/\[\[([\w-]+)\]\]/g) ?? []
  return matches.map((match) => match.slice(2, -2))
}

const getFirstUnresolvedBlankId = (textItem: FillTextTask): string | null => {
  const usedIds = new Set((textItem.blanks ?? []).map((blank) => blank.id))
  for (const id of parseBlankIdsFromContent(textItem.content)) {
    if (!usedIds.has(id)) return id
  }
  return null
}

const getBlankSyncWarning = (textItem: FillTextTask): string => {
  const fromContent = new Set(parseBlankIdsFromContent(textItem.content))
  const fromList = new Set((textItem.blanks ?? []).map((blank) => blank.id))
  const missingInBlanks = [...fromContent].filter((id) => !fromList.has(id))
  const unusedBlanks = [...fromList].filter((id) => !fromContent.has(id))
  if (missingInBlanks.length === 0 && unusedBlanks.length === 0) return ''
  const parts: string[] = []
  if (missingInBlanks.length > 0) {
    parts.push(`в content есть маркеры без пропусков: ${missingInBlanks.join(', ')}`)
  }
  if (unusedBlanks.length > 0) {
    parts.push(`в списке есть пропуски, которых нет в content: ${unusedBlanks.join(', ')}`)
  }
  return `Проверьте синхронизацию: ${parts.join('; ')}.`
}

const onTextIdInput = (textIndex: number, value: string): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const current = nextTexts[textIndex]
  if (!current) return
  const oldId = current.id
  const nextId = value.trim() || oldId
  current.id = nextId
  activeTextNames.value = activeTextNames.value.map((name) => (name === oldId ? nextId : name))
  setTextsAndEmit(nextTexts)
}

const onTextTitleInput = (textIndex: number, value: string): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const current = nextTexts[textIndex]
  if (!current) return
  current.title = value
  setTextsAndEmit(nextTexts)
}

const onTextContentInput = (textIndex: number, value: string): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const current = nextTexts[textIndex]
  if (!current) return
  current.content = value
  setTextsAndEmit(nextTexts)
}

const addText = (): void => {
  const id = genTextId()
  const nextTexts = [
    ...cloneTexts(localTexts.value),
    {
      id,
      title: '',
      content: '',
      blanks: [],
    },
  ]
  activeTextNames.value = [...activeTextNames.value, id]
  setTextsAndEmit(nextTexts)
}

const removeText = (textIndex: number): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const removed = nextTexts[textIndex]
  if (!removed) return
  nextTexts.splice(textIndex, 1)
  activeTextNames.value = activeTextNames.value.filter((id) => id !== removed.id)
  setTextsAndEmit(nextTexts)
}

const onTextDragStart = (textIndex: number, event: DragEvent): void => {
  draggedTextIndex.value = textIndex
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(textIndex))
  }
}

const onTextDragOver = (textIndex: number): void => {
  if (draggedTextIndex.value === null) return
  draggedOverTextIndex.value = textIndex
}

const onTextDragLeave = (textIndex: number, event: DragEvent): void => {
  const currentTarget = event.currentTarget as HTMLElement | null
  const relatedTarget = event.relatedTarget as Node | null
  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) return
  if (draggedOverTextIndex.value === textIndex) {
    draggedOverTextIndex.value = null
  }
}

const onTextDrop = (targetIndex: number): void => {
  const sourceIndex = draggedTextIndex.value
  draggedOverTextIndex.value = null
  if (sourceIndex === null || sourceIndex === targetIndex) return
  if (sourceIndex < 0 || sourceIndex >= localTexts.value.length) return
  const nextTexts = cloneTexts(localTexts.value)
  const [moved] = nextTexts.splice(sourceIndex, 1)
  nextTexts.splice(targetIndex, 0, moved)
  setTextsAndEmit(nextTexts)
}

const onTextDragEnd = (): void => {
  draggedTextIndex.value = null
  draggedOverTextIndex.value = null
}

const addBlank = (textIndex: number): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const textItem = nextTexts[textIndex]
  if (!textItem) return
  const preferredId = getFirstUnresolvedBlankId(textItem)
  textItem.blanks.push({
    id: preferredId ?? genBlankId(),
    correctAnswers: [''],
  })
  setTextsAndEmit(nextTexts)
}

const removeBlank = (textIndex: number, blankIndex: number): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const textItem = nextTexts[textIndex]
  if (!textItem) return
  textItem.blanks.splice(blankIndex, 1)
  setTextsAndEmit(nextTexts)
}

const onBlankIdInput = (textIndex: number, blankIndex: number, value: string): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const blank = nextTexts[textIndex]?.blanks[blankIndex]
  if (!blank) return
  blank.id = value.trim() || blank.id
  setTextsAndEmit(nextTexts)
}

const addCorrectAnswer = (textIndex: number, blankIndex: number): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const blank = nextTexts[textIndex]?.blanks[blankIndex]
  if (!blank) return
  blank.correctAnswers.push('')
  setTextsAndEmit(nextTexts)
}

const removeCorrectAnswer = (textIndex: number, blankIndex: number, answerIndex: number): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const blank = nextTexts[textIndex]?.blanks[blankIndex]
  if (!blank) return
  blank.correctAnswers.splice(answerIndex, 1)
  if (blank.correctAnswers.length === 0) {
    blank.correctAnswers.push('')
  }
  setTextsAndEmit(nextTexts)
}

const onCorrectAnswerInput = (
  textIndex: number,
  blankIndex: number,
  answerIndex: number,
  value: string,
): void => {
  const nextTexts = cloneTexts(localTexts.value)
  const answer = nextTexts[textIndex]?.blanks[blankIndex]?.correctAnswers[answerIndex]
  if (answer === undefined) return
  nextTexts[textIndex].blanks[blankIndex].correctAnswers[answerIndex] = value
  setTextsAndEmit(nextTexts)
}

const hasBlankComment = (blank: FillBlankConfig): boolean => Boolean(blank.commentMarkdown?.trim())
const getBlankCommentTooltipHtml = (blank: FillBlankConfig): string => {
  if (!hasBlankComment(blank)) return 'Комментарий не задан'
  return renderMarkdown(blank.commentMarkdown ?? '')
}

const openBlankCommentEditor = (textId: string, blankIndex: number): void => {
  const textItem = localTexts.value.find((item) => item.id === textId)
  const blank = textItem?.blanks[blankIndex]
  if (!blank) return
  editedBlankCommentRef.value = { textId, blankIndex }
  commentDraft.value = blank.commentMarkdown ?? ''
  isCommentDialogOpen.value = true
}

const closeBlankCommentEditor = (): void => {
  isCommentDialogOpen.value = false
  editedBlankCommentRef.value = null
  commentDraft.value = ''
}

const onCommentDraftChange = (value: string): void => {
  commentDraft.value = value
}

const saveBlankComment = (): void => {
  const target = editedBlankCommentRef.value
  if (!target) {
    closeBlankCommentEditor()
    return
  }
  const nextTexts = cloneTexts(localTexts.value)
  const textItem = nextTexts.find((item) => item.id === target.textId)
  const blank = textItem?.blanks[target.blankIndex]
  if (!blank) {
    closeBlankCommentEditor()
    return
  }
  blank.commentMarkdown = commentDraft.value.trim() ? commentDraft.value : undefined
  setTextsAndEmit(nextTexts)
  closeBlankCommentEditor()
}
</script>

<style scoped>
.fill-editor {
  display: grid;
  gap: 1rem;
}

.fill-editor__section {
  display: grid;
}

.fill-editor__section-title {
  margin: 0 0 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--lt-color-text-muted, #334155);
}

.fill-editor__texts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.fill-editor__text-collapse {
  margin-left: 1rem;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-card, 10px);
  padding: 0.35rem;
  background: var(--lt-color-secondary-bg, #f8fafc);
}

.fill-editor__text-collapse :deep(.el-collapse-item) {
  margin-bottom: 0.4rem;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-control, 8px);
  overflow: hidden;
}

.fill-editor__text-collapse :deep(.el-collapse-item:last-child) {
  margin-bottom: 0;
}

.fill-editor__text-collapse :deep(.el-collapse-item__header) {
  background: var(--lt-color-card-bg, #ffffff);
  padding-left: 0.55rem;
}

.fill-editor__text-item--drag-over :deep(.el-collapse-item__header) {
  background: color-mix(in srgb, var(--lt-color-primary, #2f6feb) 10%, #ffffff);
}

.fill-editor__text-collapse :deep(.el-collapse-item__wrap),
.fill-editor__text-collapse :deep(.el-collapse-item__content) {
  background: var(--lt-color-card-bg, #ffffff);
}

.fill-editor__text-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  gap: 0.5rem;
  padding-right: 0.35rem;
  overflow: hidden;
}

.fill-editor__text-title {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--lt-color-text-primary, #111827);
}

.fill-editor__text-actions {
  display: flex;
  flex-shrink: 0;
  margin-right: 1.35rem;
}

.fill-editor__text-editor {
  display: grid;
  gap: 0.75rem;
  padding: 0.4rem 0.75rem 0.75rem;
}

.fill-editor__field {
  display: grid;
  gap: 0.35rem;
}

.fill-editor__field-label {
  font-size: 0.82rem;
  color: var(--lt-color-text-muted, #334155);
}

.fill-editor__warning {
  margin: 0;
  font-size: 0.8rem;
  color: var(--lt-color-incorrect-text, #9f1239);
}

.fill-editor__blanks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.fill-editor__blanks-list {
  display: grid;
  gap: 0.5rem;
}

.fill-editor__blank-row {
  display: grid;
  grid-template-columns: minmax(140px, 170px) minmax(220px, 1fr) auto auto;
  align-items: start;
  gap: 0.5rem;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem;
  background: var(--lt-color-card-bg, #fff);
}

.fill-editor__answers-editor {
  display: grid;
  gap: 0.35rem;
}

.fill-editor__answers-label {
  font-size: 0.78rem;
  color: var(--lt-color-text-muted, #64748b);
}

.fill-editor__answers-list {
  display: grid;
  gap: 0.35rem;
}

.fill-editor__answer-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.fill-editor__answer-row .fill-editor__input {
  flex: 1 1 auto;
  min-width: 0;
}

.fill-editor__add-answer-button {
  justify-self: start;
}

.fill-editor__drag-handle {
  user-select: none;
  cursor: grab;
  font-size: 1rem;
  color: var(--lt-color-text-muted, #64748b);
  line-height: 1;
}

.fill-editor__drag-handle--text {
  flex-shrink: 0;
}

.fill-editor__input {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--lt-color-input-border, #9ca3af);
  border-radius: var(--lt-radius-control, 8px);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-field-text, #111827);
  font-size: 0.9rem;
}

.fill-editor__input:focus {
  outline: none;
  border-color: var(--lt-color-primary, #2f6feb);
}

.fill-editor__input--blank-id {
  min-width: 0;
}

.fill-editor__textarea {
  width: 100%;
  min-height: 120px;
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

.fill-editor__comment-button {
  font-weight: 700;
  color: var(--lt-color-text-muted, #64748b);
  border-color: var(--lt-color-input-border, #cbd5e1);
}

.fill-editor__comment-button--active {
  color: var(--lt-color-primary, #2f6feb);
  border-color: color-mix(in srgb, var(--lt-color-primary, #2f6feb) 55%, #ffffff);
  background: color-mix(in srgb, var(--lt-color-primary, #2f6feb) 10%, #ffffff);
}

.fill-editor__delete-button {
  font-size: 0.82rem;
  line-height: 1;
  padding-left: 0.3rem;
  padding-right: 0.3rem;
}

.fill-editor__comment-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

::deep(.fill-editor__comment-tooltip) {
  max-width: 420px;
}

.fill-editor__comment-tooltip-content {
  font-size: 0.82rem;
  line-height: 1.35;
}

.fill-editor__comment-tooltip-content :deep(p) {
  margin: 0;
}
</style>
