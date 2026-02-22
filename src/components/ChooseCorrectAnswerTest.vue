<template>
  <section class="test">
    <h2 class="test__title">{{ title }}</h2>
    <div v-if="descriptionMarkdown" class="test__description" v-html="renderedDescription"></div>
    <p v-if="checkMode" class="test__stats">Правильно: {{ correctQuestionsCount }} из {{ totalQuestions }}</p>

    <div v-for="question in questions" :key="question.id" class="test__question">
      <p class="test__question-text">{{ question.text }}</p>
      <ul class="test__answers">
        <li
          v-for="option in question.options"
          :key="option.id"
          class="test__answer"
          :class="getAnswerStateClass(question.id, option.id)"
        >
          <label>
            <input
              :type="question.multiple ? 'checkbox' : 'radio'"
              :name="question.id"
              :checked="isSelected(question.id, option.id)"
              @change="toggleSelection(question, option.id)"
            />
            <span class="test__answer-text">{{ option.text }}</span>
            <span v-if="showAnswersMode && isCorrectOption(question.id, option.id)" class="test__correct-icon">
              ✓
            </span>
          </label>
        </li>
      </ul>
    </div>

    <div class="test__actions">
      <button class="test__check-btn" type="button" @click="checkAnswers">Проверить</button>
      <button class="test__secondary-btn" type="button" @click="showAnswers">Показать правильные ответы</button>
      <button class="test__secondary-btn" type="button" @click="resetFeedback">Сброс</button>
      <button class="test__secondary-btn" type="button" @click="restartTest">Начать заново</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { renderMarkdown } from '../utils/markdown'

export interface TestOption {
  id: string
  text: string
}

export interface TestQuestion {
  id: string
  text: string
  multiple: boolean
  options: TestOption[]
  correctOptionIds: string[]
}

interface Props {
  title?: string
  descriptionMarkdown?: string
  questions: TestQuestion[]
}

const props = withDefaults(defineProps<Props>(), { title: 'Выбери правильный ответ' })
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''))
const selectedAnswers = reactive<Record<string, string[]>>({})
const checkMode = ref(false)
const showAnswersMode = ref(false)

const isSelected = (questionId: string, optionId: string): boolean =>
  (selectedAnswers[questionId] ?? []).includes(optionId)

const isCorrectOption = (questionId: string, optionId: string): boolean =>
  props.questions.find((q) => q.id === questionId)?.correctOptionIds.includes(optionId) ?? false

const toggleSelection = (question: TestQuestion, optionId: string): void => {
  checkMode.value = false
  showAnswersMode.value = false
  if (!selectedAnswers[question.id]) selectedAnswers[question.id] = []
  if (question.multiple) {
    const idx = selectedAnswers[question.id].indexOf(optionId)
    if (idx >= 0) selectedAnswers[question.id].splice(idx, 1)
    else selectedAnswers[question.id].push(optionId)
    return
  }
  selectedAnswers[question.id] = [optionId]
}

const isQuestionCorrect = (question: TestQuestion): boolean => {
  const selected = [...(selectedAnswers[question.id] ?? [])].sort()
  const correct = [...question.correctOptionIds].sort()
  return selected.length === correct.length && selected.every((id, i) => id === correct[i])
}

const totalQuestions = computed(() => props.questions.length)
const correctQuestionsCount = computed(() =>
  props.questions.reduce((acc, q) => (isQuestionCorrect(q) ? acc + 1 : acc), 0),
)

const checkAnswers = (): void => {
  checkMode.value = true
}
const showAnswers = (): void => {
  showAnswersMode.value = true
}
const resetFeedback = (): void => {
  checkMode.value = false
  showAnswersMode.value = false
}
const restartTest = (): void => {
  resetFeedback()
  Object.keys(selectedAnswers).forEach((k) => delete selectedAnswers[k])
}

const getAnswerStateClass = (questionId: string, optionId: string): string => {
  const question = props.questions.find((q) => q.id === questionId)
  if (!question) return ''
  if (showAnswersMode.value) {
    if (question.correctOptionIds.includes(optionId)) return 'test__answer--correct'
    return isSelected(questionId, optionId) ? 'test__answer--incorrect' : ''
  }
  if (!checkMode.value || !isSelected(questionId, optionId)) return ''
  return question.correctOptionIds.includes(optionId) ? 'test__answer--correct' : 'test__answer--incorrect'
}
</script>

<style scoped>
.test { display: grid; gap: 1rem; max-width: 760px; }
.test__stats { margin: -0.25rem 0 0; color: #334155; }
.test__description { color: #475569; margin-top: -0.35rem; }
:deep(.test__description p) { margin: 0.25rem 0; }
:deep(.test__description ul) { margin: 0.25rem 0; padding-left: 1.2rem; }
:deep(.test__description h3),
:deep(.test__description h4),
:deep(.test__description h5) { margin: 0.35rem 0; font-size: 0.95rem; }
.test__question { border: 1px solid #d7d7d7; border-radius: 12px; padding: 1rem; background: #fff; }
.test__question-text { margin: 0; font-weight: 600; }
.test__answers { margin: 0.75rem 0 0; padding: 0; list-style: none; display: grid; gap: 0.5rem; }
.test__answer { border: 1px solid transparent; border-radius: 8px; padding: 0.5rem 0.65rem; }
.test__answer label { display: flex; align-items: center; gap: 0.5rem; width: 100%; }
.test__answer-text { flex: 1; }
.test__correct-icon { color: #1f9d42; font-weight: 700; }
.test__answer--correct { background: #e8ffea; border-color: #87d78b; }
.test__answer--incorrect { background: #ffe9f1; border-color: #f1a1be; }
.test__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.test__check-btn { border: 1px solid #2f6feb; background: #2f6feb; color: #fff; border-radius: 8px; padding: 0.5rem 1rem; }
.test__secondary-btn { border: 1px solid #d1d5db; background: #fff; color: #111827; border-radius: 8px; padding: 0.5rem 1rem; }
</style>
