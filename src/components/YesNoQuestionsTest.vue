<template>
  <section class="yn-test">
    <h2>{{ title }}</h2>
    <div v-if="descriptionMarkdown" class="yn-test__description" v-html="renderedDescription"></div>
    <div v-if="showProgress" class="yn-test__progress">
      <div class="yn-test__progress-head">
        <p class="yn-test__progress-label">Прогресс: {{ completedTasksCount }} из {{ totalTasksCount }}</p>
        <p class="yn-test__progress-stats">Правильно: {{ correctCheckedTasksCount }} из {{ checkedTasksCount }}</p>
      </div>
      <div
        class="yn-test__progress-track"
        role="progressbar"
        :aria-valuemin="0"
        :aria-valuemax="totalTasksCount"
        :aria-valuenow="completedTasksCount"
      >
        <div class="yn-test__progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>

    <article v-for="task in tasks" :key="task.id" class="yn-test__task">
      <span v-if="isTaskCompleted(task.id)" class="yn-test__completed-mark" aria-hidden="true">✓</span>
      <h3 v-if="task.title">{{ task.title }}</h3>

      <div v-if="task.textMarkdown" class="yn-test__text" v-html="renderMarkdown(task.textMarkdown)"></div>

      <ul class="yn-test__questions">
        <li
          v-for="question in task.questions"
          :key="question.id"
          class="yn-test__question"
          :class="getQuestionStateClass(task.id, question.id)"
        >
          <span class="yn-test__question-text">{{ question.text }}</span>
          <div class="yn-test__question-actions">
            <button
              type="button"
              class="yn-test__answer-btn"
              :class="getAnswerButtonClass(task.id, question.id, true)"
              @click="selectAnswer(task.id, question.id, true)"
            >
              ДА
            </button>
            <button
              type="button"
              class="yn-test__answer-btn"
              :class="getAnswerButtonClass(task.id, question.id, false)"
              @click="selectAnswer(task.id, question.id, false)"
            >
              НЕТ
            </button>
          </div>
        </li>
      </ul>
    </article>

    <div class="yn-test__actions">
      <button class="yn-test__check-btn" type="button" @click="checkAnswers">Проверить</button>
      <button class="yn-test__secondary-btn" type="button" @click="showAnswers">Показать правильные ответы</button>
      <button class="yn-test__secondary-btn" type="button" @click="resetFeedback">Сброс</button>
      <button class="yn-test__secondary-btn" type="button" @click="restartTest">Начать заново</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { renderMarkdown } from '../utils/markdown'
import type { YesNoQuestion, YesNoTask } from '../types/component-contracts'
import type { StatefulTestComponentHandle, YesNoQuestionsState } from '../types/test-state'

interface Props {
  title?: string
  descriptionMarkdown?: string
  showProgress?: boolean
  tasks: YesNoTask[]
  initialState?: YesNoQuestionsState
}

const props = withDefaults(defineProps<Props>(), { title: 'Ответьте ДА или НЕТ', showProgress: true })
const emit = defineEmits<{
  (
    event: 'progress-change',
    payload: { completed: number; total: number; correctChecked: number; checked: number },
  ): void
  (event: 'state-change', payload: YesNoQuestionsState): void
}>()
const renderedDescription = computed(() => renderMarkdown(props.descriptionMarkdown ?? ''))

const selectedAnswers = reactive<Record<string, boolean>>({})
const checkMode = ref(false)
const showAnswersMode = ref(false)

const keyOf = (taskId: string, questionId: string): string => `${taskId}::${questionId}`
const getSelectedAnswer = (taskId: string, questionId: string): boolean | undefined =>
  selectedAnswers[keyOf(taskId, questionId)]

const findQuestion = (taskId: string, questionId: string): YesNoQuestion | undefined =>
  props.tasks.find((task) => task.id === taskId)?.questions.find((question) => question.id === questionId)

const isQuestionCorrect = (taskId: string, questionId: string): boolean => {
  const question = findQuestion(taskId, questionId)
  if (!question) return false
  return getSelectedAnswer(taskId, questionId) === question.correctAnswer
}

const selectAnswer = (taskId: string, questionId: string, answer: boolean): void => {
  checkMode.value = false
  showAnswersMode.value = false
  selectedAnswers[keyOf(taskId, questionId)] = answer
}

const totalTasksCount = computed(() => props.tasks.length)
const isTaskCompleted = (taskId: string): boolean => {
  const task = props.tasks.find((item) => item.id === taskId)
  if (!task) return false
  return task.questions.every((question) => getSelectedAnswer(taskId, question.id) !== undefined)
}
const isTaskCorrect = (taskId: string): boolean => {
  const task = props.tasks.find((item) => item.id === taskId)
  if (!task) return false
  return task.questions.every((question) => isQuestionCorrect(taskId, question.id))
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

const getQuestionStateClass = (taskId: string, questionId: string): string => {
  const hasAnswer = getSelectedAnswer(taskId, questionId) !== undefined
  if (!checkMode.value) return ''
  if (!hasAnswer) return 'yn-test__question--incorrect'
  return isQuestionCorrect(taskId, questionId) ? 'yn-test__question--correct' : 'yn-test__question--incorrect'
}

const getAnswerButtonClass = (taskId: string, questionId: string, optionValue: boolean): string => {
  const selected = getSelectedAnswer(taskId, questionId)
  const question = findQuestion(taskId, questionId)
  if (!question) return ''
  const classes: string[] = []

  if (selected === optionValue) classes.push('yn-test__answer-btn--selected')
  if (showAnswersMode.value && question.correctAnswer === optionValue) {
    classes.push('yn-test__answer-btn--correct-answer')
  }

  return classes.join(' ')
}

const toBoolean = (value: unknown): boolean => value === true
const normalizeState = (state: unknown): YesNoQuestionsState => {
  const raw = (state ?? {}) as Partial<YesNoQuestionsState>
  const validKeys = new Set(
    props.tasks.flatMap((task) => task.questions.map((question) => keyOf(task.id, question.id))),
  )
  const selectedAnswers: Record<string, boolean> = {}
  const rawSelected = raw.selectedAnswers ?? {}
  Object.entries(rawSelected).forEach(([answerKey, answerValue]) => {
    if (!validKeys.has(answerKey) || typeof answerValue !== 'boolean') return
    selectedAnswers[answerKey] = answerValue
  })
  return {
    selectedAnswers,
    checkMode: toBoolean(raw.checkMode),
    showAnswersMode: toBoolean(raw.showAnswersMode),
  }
}
const applyState = (state: unknown): void => {
  const normalized = normalizeState(state)
  Object.keys(selectedAnswers).forEach((key) => delete selectedAnswers[key])
  Object.entries(normalized.selectedAnswers).forEach(([answerKey, answerValue]) => {
    selectedAnswers[answerKey] = answerValue
  })
  checkMode.value = normalized.checkMode
  showAnswersMode.value = normalized.showAnswersMode
}
const getState = (): YesNoQuestionsState => normalizeState({
  selectedAnswers,
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
    applyState(getState())
  },
  { deep: true },
)
watch(
  [selectedAnswers, checkMode, showAnswersMode],
  () => {
    emit('state-change', getState())
  },
  { immediate: true, deep: true },
)
defineExpose<StatefulTestComponentHandle<YesNoQuestionsState>>({ getState, setState })
</script>

<style scoped>
.yn-test {
  display: grid;
  gap: 1rem;
  max-width: 900px;
  color: var(--lt-color-text-primary, #111827);
}
.yn-test__progress { display: grid; gap: 0.35rem; }
.yn-test__progress-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; }
.yn-test__progress-label { margin: 0; color: var(--lt-color-text-muted, #334155); }
.yn-test__progress-stats { margin: 0; color: var(--lt-color-text-muted, #334155); }
.yn-test__progress-track {
  width: 100%;
  height: 0.55rem;
  border-radius: 999px;
  background: var(--lt-color-progress-track, #e5e7eb);
  overflow: hidden;
}
.yn-test__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--lt-color-progress-fill, #2f6feb);
  transition: width 0.2s ease;
}
.yn-test__description { color: var(--lt-color-text-secondary, #475569); margin-top: -0.35rem; }
:deep(.yn-test__description p) { margin: 0.25rem 0; }
:deep(.yn-test__description ul) { margin: 0.25rem 0; padding-left: 1.2rem; }
:deep(.yn-test__description h3),
:deep(.yn-test__description h4),
:deep(.yn-test__description h5) { margin: 0.35rem 0; font-size: 0.95rem; }
.yn-test__task {
  position: relative;
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-card, 12px);
  padding: 1rem;
  background: var(--lt-color-card-bg, #fff);
}
.yn-test__completed-mark {
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
.yn-test__text {
  margin: 0.35rem 0 0.8rem;
  line-height: 1.5;
}
:deep(.yn-test__text p) { margin: 0.25rem 0; }
:deep(.yn-test__text ul) { margin: 0.25rem 0; padding-left: 1.2rem; }
:deep(.yn-test__text h3),
:deep(.yn-test__text h4),
:deep(.yn-test__text h5) { margin: 0.35rem 0; font-size: 0.95rem; }
.yn-test__questions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}
.yn-test__question {
  border: 1px solid transparent;
  border-radius: var(--lt-radius-control, 8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.6rem;
}
.yn-test__question--correct {
  background: var(--lt-color-correct-bg, #e8ffea);
  border-color: var(--lt-color-correct-border, #87d78b);
}
.yn-test__question--incorrect {
  background: var(--lt-color-incorrect-bg, #ffe9f1);
  border-color: var(--lt-color-incorrect-border, #f1a1be);
}
.yn-test__question-text {
  flex: 1;
  font-weight: 700;
}
.yn-test__question-actions {
  display: flex;
  gap: 0.45rem;
  flex-shrink: 0;
}
.yn-test__answer-btn {
  min-width: 58px;
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.3rem 0.6rem;
}
.yn-test__answer-btn--selected {
  border-color: var(--lt-color-primary, #2f6feb);
  box-shadow: 0 0 0 1px var(--lt-color-primary, #2f6feb) inset;
}
.yn-test__answer-btn--correct-answer {
  font-weight: 700;
}
.yn-test__actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.yn-test__check-btn {
  border: 1px solid var(--lt-color-primary, #2f6feb);
  background: var(--lt-color-primary, #2f6feb);
  color: var(--lt-color-primary-contrast, #fff);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem 1rem;
}
.yn-test__secondary-btn {
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem 1rem;
}

@media (max-width: 720px) {
  .yn-test__question {
    flex-direction: column;
    align-items: stretch;
  }
  .yn-test__question-actions {
    justify-content: flex-end;
  }
}
</style>
