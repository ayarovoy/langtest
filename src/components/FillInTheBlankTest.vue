<template>
  <section class="fill-test">
    <h2>{{ title }}</h2>
    <div v-if="descriptionMarkdown" class="fill-test__description" v-html="renderedDescription"></div>
    <div v-if="showProgress" class="fill-test__progress">
      <div class="fill-test__progress-head">
        <p class="fill-test__progress-label">Прогресс: {{ completedTextsCount }} из {{ totalTextsCount }}</p>
        <p class="fill-test__progress-stats">Правильно: {{ correctCheckedTextsCount }} из {{ checkedTextsCount }}</p>
      </div>
      <div
        class="fill-test__progress-track"
        role="progressbar"
        :aria-valuemin="0"
        :aria-valuemax="totalTextsCount"
        :aria-valuenow="completedTextsCount"
      >
        <div class="fill-test__progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>

    <article v-for="textItem in texts" :key="textItem.id" class="fill-test__card">
      <span v-if="isTextCompleted(textItem.id)" class="fill-test__completed-mark" aria-hidden="true">✓</span>
      <h3 v-if="textItem.title">{{ textItem.title }}</h3>
      <p class="fill-test__text">
        <template v-for="(segment, index) in getSegments(textItem.id)" :key="`${textItem.id}-${index}`">
          <span v-if="segment.type === 'text'">{{ segment.value }}</span>
          <span v-else class="fill-test__blank" :class="getBlankStateClass(textItem.id, segment.blankId)">
            <span
              v-if="showAnswersMode && hasIncorrectUserAnswer(textItem.id, segment.blankId)"
              class="fill-test__wrong-answer"
            >
              {{ getUserAnswer(textItem.id, segment.blankId) }}
            </span>
            <span
              v-if="showAnswersMode"
              class="fill-test__answer"
              :title="getDisplayedAnswer(textItem.id, segment.blankId)"
            >
              {{ getDisplayedAnswer(textItem.id, segment.blankId) }}
            </span>
            <input
              v-else
              class="fill-test__input"
              :value="getDisplayedAnswer(textItem.id, segment.blankId)"
              :title="getDisplayedAnswer(textItem.id, segment.blankId)"
              type="text"
              @input="onInputChange(textItem.id, segment.blankId, $event)"
            />
            <AnswerCommentPopover
              v-if="showAnswersMode && getBlankComment(textItem.id, segment.blankId)"
              :markdown="getBlankComment(textItem.id, segment.blankId)"
              :is-open="openCommentKey === keyOf(textItem.id, segment.blankId)"
              @toggle="toggleComment(textItem.id, segment.blankId)"
            />
          </span>
        </template>
      </p>
    </article>

    <div class="fill-test__actions">
      <button class="fill-test__check-btn" type="button" @click="checkAnswers">Проверить</button>
      <button class="fill-test__secondary-btn" type="button" @click="showAnswers">Показать правильные ответы</button>
      <button class="fill-test__secondary-btn" type="button" @click="resetFeedback">Сброс</button>
      <button class="fill-test__secondary-btn" type="button" @click="restartTest">Начать заново</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AnswerCommentPopover from './AnswerCommentPopover.vue'
import { renderMarkdown } from '../utils/markdown'
import type { FillBlankConfig, FillTextTask } from '../types/component-contracts'
import type { FillInTheBlankState, StatefulTestComponentHandle } from '../types/test-state'

interface Props {
  title?: string
  descriptionMarkdown?: string
  showProgress?: boolean
  texts: FillTextTask[]
  initialState?: FillInTheBlankState
}
interface FillSegmentText { type: 'text'; value: string }
interface FillSegmentBlank { type: 'blank'; blankId: string }
type FillSegment = FillSegmentText | FillSegmentBlank

const props = withDefaults(defineProps<Props>(), { title: 'Заполни пропуск', showProgress: true })
const emit = defineEmits<{
  (
    event: 'progress-change',
    payload: { completed: number; total: number; correctChecked: number; checked: number },
  ): void
  (event: 'state-change', payload: FillInTheBlankState): void
}>()
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''))
const userAnswers = reactive<Record<string, string>>({})
const checkMode = ref(false)
const showAnswersMode = ref(false)
const openCommentKey = ref('')

const keyOf = (textId: string, blankId: string): string => `${textId}::${blankId}`
const normalize = (value: string): string => value.trim().toLowerCase()
const findBlank = (textId: string, blankId: string): FillBlankConfig | undefined =>
  props.texts.find((t) => t.id === textId)?.blanks.find((b) => b.id === blankId)
const getUserAnswer = (textId: string, blankId: string): string => userAnswers[keyOf(textId, blankId)] ?? ''
const getBlankComment = (textId: string, blankId: string): string =>
  findBlank(textId, blankId)?.commentMarkdown ?? ''
const getCorrectAnswersText = (textId: string, blankId: string): string =>
  findBlank(textId, blankId)?.correctAnswers.join(' / ') ?? ''
const getDisplayedAnswer = (textId: string, blankId: string): string =>
  showAnswersMode.value ? getCorrectAnswersText(textId, blankId) : getUserAnswer(textId, blankId)
const isBlankCorrect = (textId: string, blankId: string): boolean => {
  const blank = findBlank(textId, blankId)
  if (!blank) return false
  const userValue = normalize(getUserAnswer(textId, blankId))
  return blank.correctAnswers.some((a) => normalize(a) === userValue)
}

const totalTextsCount = computed(() => props.texts.length)
const isTextCompleted = (textId: string): boolean => {
  const text = props.texts.find((item) => item.id === textId)
  if (!text) return false
  return text.blanks.every((blank) => getUserAnswer(textId, blank.id).trim().length > 0)
}
const isTextCorrect = (textId: string): boolean => {
  const text = props.texts.find((item) => item.id === textId)
  if (!text) return false
  return text.blanks.every((blank) => isBlankCorrect(textId, blank.id))
}
const completedTextsCount = computed(() =>
  props.texts.reduce((acc, text) => (isTextCompleted(text.id) ? acc + 1 : acc), 0),
)
const progressPercent = computed(() => {
  if (totalTextsCount.value === 0) return 0
  return Math.round((completedTextsCount.value / totalTextsCount.value) * 100)
})
const checkedTextsCount = computed(() => (checkMode.value ? totalTextsCount.value : 0))
const correctCheckedTextsCount = computed(() => {
  if (!checkMode.value) return 0
  return props.texts.reduce((acc, text) => (isTextCorrect(text.id) ? acc + 1 : acc), 0)
})
watch(
  [completedTextsCount, totalTextsCount, correctCheckedTextsCount, checkedTextsCount],
  ([completed, total, correctChecked, checked]) => {
    emit('progress-change', { completed, total, correctChecked, checked })
  },
  { immediate: true },
)

const parseContent = (content: string): FillSegment[] => {
  const parts = content.split(/(\[\[[\w-]+\]\])/g)
  const segments: FillSegment[] = []
  for (const part of parts) {
    if (!part) continue
    const m = part.match(/^\[\[([\w-]+)\]\]$/)
    if (m) segments.push({ type: 'blank', blankId: m[1] })
    else segments.push({ type: 'text', value: part })
  }
  return segments
}
const segmentsByTextId = computed<Record<string, FillSegment[]>>(() =>
  Object.fromEntries(props.texts.map((item) => [item.id, parseContent(item.content)])),
)
const getSegments = (textId: string): FillSegment[] => segmentsByTextId.value[textId] ?? []

const onInputChange = (textId: string, blankId: string, event: Event): void => {
  checkMode.value = false
  showAnswersMode.value = false
  openCommentKey.value = ''
  userAnswers[keyOf(textId, blankId)] = (event.target as HTMLInputElement).value
}
const hasIncorrectUserAnswer = (textId: string, blankId: string): boolean => {
  const answer = getUserAnswer(textId, blankId).trim()
  return answer.length > 0 && !isBlankCorrect(textId, blankId)
}

const toggleComment = (textId: string, blankId: string): void => {
  const key = keyOf(textId, blankId)
  openCommentKey.value = openCommentKey.value === key ? '' : key
}

const checkAnswers = (): void => { checkMode.value = true }
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
  Object.keys(userAnswers).forEach((k) => delete userAnswers[k])
}
const getBlankStateClass = (textId: string, blankId: string): string => {
  if (!checkMode.value) return ''
  return isBlankCorrect(textId, blankId) ? 'fill-test__blank--correct' : 'fill-test__blank--incorrect'
}

const toBoolean = (value: unknown): boolean => value === true
const normalizeState = (state: unknown): FillInTheBlankState => {
  const raw = (state ?? {}) as Partial<FillInTheBlankState>
  const validKeys = new Set(
    props.texts.flatMap((text) => text.blanks.map((blank) => keyOf(text.id, blank.id))),
  )
  const userAnswers: Record<string, string> = {}
  const rawAnswers = raw.userAnswers ?? {}
  Object.entries(rawAnswers).forEach(([blankKey, value]) => {
    if (!validKeys.has(blankKey) || typeof value !== 'string') return
    userAnswers[blankKey] = value
  })
  return {
    userAnswers,
    checkMode: toBoolean(raw.checkMode),
    showAnswersMode: toBoolean(raw.showAnswersMode),
  }
}
const applyState = (state: unknown): void => {
  const normalized = normalizeState(state)
  Object.keys(userAnswers).forEach((key) => delete userAnswers[key])
  Object.entries(normalized.userAnswers).forEach(([blankKey, value]) => {
    userAnswers[blankKey] = value
  })
  checkMode.value = normalized.checkMode
  showAnswersMode.value = normalized.showAnswersMode
  openCommentKey.value = ''
}
const getState = (): FillInTheBlankState => normalizeState({
  userAnswers,
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
  () => props.texts,
  () => {
    applyState(getState())
  },
  { deep: true },
)
watch(
  [userAnswers, checkMode, showAnswersMode],
  () => {
    emit('state-change', getState())
  },
  { immediate: true, deep: true },
)
defineExpose<StatefulTestComponentHandle<FillInTheBlankState>>({ getState, setState })
</script>

<style scoped>
.fill-test {
  display: grid;
  gap: 1rem;
  max-width: 900px;
  color: var(--lt-color-text-primary, #111827);
}
.fill-test__progress { display: grid; gap: 0.35rem; }
.fill-test__progress-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; }
.fill-test__progress-label { margin: 0; color: var(--lt-color-text-muted, #334155); }
.fill-test__progress-stats { margin: 0; color: var(--lt-color-text-muted, #334155); }
.fill-test__progress-track {
  width: 100%;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--lt-color-progress-track, #e5e7eb);
  overflow: hidden;
}
.fill-test__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--lt-color-progress-fill, #2f6feb);
  transition: width 0.2s ease;
}
.fill-test__description { color: var(--lt-color-text-secondary, #475569); margin-top: -0.35rem; }
:deep(.fill-test__description p) { margin: 0.25rem 0; }
:deep(.fill-test__description ul) { margin: 0.25rem 0; padding-left: 1.2rem; }
:deep(.fill-test__description h3),
:deep(.fill-test__description h4),
:deep(.fill-test__description h5) { margin: 0.35rem 0; font-size: 0.95rem; }
.fill-test__card {
  position: relative;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-card, 12px);
  padding: 1rem;
  background: var(--lt-color-card-bg, #fff);
}
.fill-test__completed-mark {
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
.fill-test__text { line-height: 1.9; }
.fill-test__blank {
  display: inline-flex;
  gap: 0.35rem;
  border: 1px solid transparent;
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.15rem 0.2rem;
  margin: 0 0.15rem;
}
.fill-test__blank--correct {
  background: var(--lt-color-correct-bg, #e8ffea);
  border-color: var(--lt-color-correct-border, #87d78b);
}
.fill-test__blank--incorrect {
  background: var(--lt-color-incorrect-bg, #ffe9f1);
  border-color: var(--lt-color-incorrect-border, #f1a1be);
}
.fill-test__input {
  width: 150px;
  border: none;
  border-bottom: 2px solid var(--lt-color-input-border, #9ca3af);
  background: transparent;
  color: var(--lt-color-field-text, var(--lt-color-text-primary, #111827));
  caret-color: var(--lt-color-field-text, var(--lt-color-text-primary, #111827));
  padding: 0.1rem 0.15rem;
}
.fill-test__input::placeholder {
  color: var(--lt-color-placeholder, #9ca3af);
}
.fill-test__answer {
  display: inline-block;
  min-width: 150px;
  max-width: min(100%, 28rem);
  border-bottom: 2px solid var(--lt-color-input-border, #9ca3af);
  color: var(--lt-color-field-text, var(--lt-color-text-primary, #111827));
  padding: 0.1rem 0.15rem;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.4;
}
.fill-test__wrong-answer {
  color: var(--lt-color-incorrect-text, #9f1239);
  text-decoration: line-through;
  font-size: 0.88rem;
}
.fill-test__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.fill-test__check-btn {
  border: 1px solid var(--lt-color-primary, #2f6feb);
  background: var(--lt-color-primary, #2f6feb);
  color: var(--lt-color-primary-contrast, #fff);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem 1rem;
}
.fill-test__secondary-btn {
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem 1rem;
}
</style>
