<template>
  <section class="fill-test">
    <h2>{{ title }}</h2>
    <div v-if="descriptionMarkdown" class="fill-test__description" v-html="renderedDescription"></div>
    <p v-if="checkMode" class="fill-test__stats">Правильно: {{ correctBlanksCount }} из {{ totalBlanksCount }}</p>

    <article v-for="textItem in texts" :key="textItem.id" class="fill-test__card">
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
            <input
              class="fill-test__input"
              :value="getDisplayedAnswer(textItem.id, segment.blankId)"
              type="text"
              @input="onInputChange(textItem.id, segment.blankId, $event)"
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
import { computed, reactive, ref } from 'vue'
import { renderMarkdown } from '../utils/markdown'

export interface FillBlankConfig { id: string; correctAnswers: string[] }
export interface FillTextTask { id: string; title?: string; content: string; blanks: FillBlankConfig[] }
interface Props { title?: string; descriptionMarkdown?: string; texts: FillTextTask[] }
interface FillSegmentText { type: 'text'; value: string }
interface FillSegmentBlank { type: 'blank'; blankId: string }
type FillSegment = FillSegmentText | FillSegmentBlank

const props = withDefaults(defineProps<Props>(), { title: 'Заполни пропуск' })
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''))
const userAnswers = reactive<Record<string, string>>({})
const checkMode = ref(false)
const showAnswersMode = ref(false)

const keyOf = (textId: string, blankId: string): string => `${textId}::${blankId}`
const normalize = (value: string): string => value.trim().toLowerCase()
const findBlank = (textId: string, blankId: string): FillBlankConfig | undefined =>
  props.texts.find((t) => t.id === textId)?.blanks.find((b) => b.id === blankId)
const getUserAnswer = (textId: string, blankId: string): string => userAnswers[keyOf(textId, blankId)] ?? ''
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

const totalBlanksCount = computed(() => props.texts.reduce((acc, t) => acc + t.blanks.length, 0))
const correctBlanksCount = computed(() =>
  props.texts.reduce(
    (acc, t) => acc + t.blanks.reduce((bAcc, b) => (isBlankCorrect(t.id, b.id) ? bAcc + 1 : bAcc), 0),
    0,
  ),
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
  userAnswers[keyOf(textId, blankId)] = (event.target as HTMLInputElement).value
}
const hasIncorrectUserAnswer = (textId: string, blankId: string): boolean => {
  const answer = getUserAnswer(textId, blankId).trim()
  return answer.length > 0 && !isBlankCorrect(textId, blankId)
}

const checkAnswers = (): void => { checkMode.value = true }
const showAnswers = (): void => { showAnswersMode.value = true }
const resetFeedback = (): void => { checkMode.value = false; showAnswersMode.value = false }
const restartTest = (): void => {
  resetFeedback()
  Object.keys(userAnswers).forEach((k) => delete userAnswers[k])
}
const getBlankStateClass = (textId: string, blankId: string): string => {
  if (!checkMode.value) return ''
  return isBlankCorrect(textId, blankId) ? 'fill-test__blank--correct' : 'fill-test__blank--incorrect'
}
</script>

<style scoped>
.fill-test { display: grid; gap: 1rem; max-width: 900px; }
.fill-test__stats { margin: -0.25rem 0 0; color: #334155; }
.fill-test__description { color: #475569; margin-top: -0.35rem; }
:deep(.fill-test__description p) { margin: 0.25rem 0; }
:deep(.fill-test__description ul) { margin: 0.25rem 0; padding-left: 1.2rem; }
:deep(.fill-test__description h3),
:deep(.fill-test__description h4),
:deep(.fill-test__description h5) { margin: 0.35rem 0; font-size: 0.95rem; }
.fill-test__card { border: 1px solid #d7d7d7; border-radius: 12px; padding: 1rem; background: #fff; }
.fill-test__text { line-height: 1.9; }
.fill-test__blank { display: inline-flex; gap: 0.35rem; border: 1px solid transparent; border-radius: 8px; padding: 0.15rem 0.2rem; margin: 0 0.15rem; }
.fill-test__blank--correct { background: #e8ffea; border-color: #87d78b; }
.fill-test__blank--incorrect { background: #ffe9f1; border-color: #f1a1be; }
.fill-test__input { width: 150px; border: none; border-bottom: 2px solid #9ca3af; background: transparent; padding: 0.1rem 0.15rem; }
.fill-test__wrong-answer { color: #9f1239; text-decoration: line-through; font-size: 0.88rem; }
.fill-test__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.fill-test__check-btn { border: 1px solid #2f6feb; background: #2f6feb; color: #fff; border-radius: 8px; padding: 0.5rem 1rem; }
.fill-test__secondary-btn { border: 1px solid #d1d5db; background: #fff; color: #111827; border-radius: 8px; padding: 0.5rem 1rem; }
</style>
