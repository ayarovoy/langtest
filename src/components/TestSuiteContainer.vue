<template>
  <section class="suite">
    <div class="suite__progress">
      <div class="suite__progress-head">
        <p class="suite__progress-label">Общий прогресс: {{ completedItemsCount }} из {{ totalItemsCount }}</p>
        <p class="suite__progress-stats">Правильно: {{ correctCheckedItemsCount }} из {{ checkedItemsCount }}</p>
      </div>
      <div
        class="suite__progress-track"
        role="progressbar"
        :aria-valuemin="0"
        :aria-valuemax="totalItemsCount"
        :aria-valuenow="completedItemsCount"
      >
        <div class="suite__progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>
    <article v-for="item in items" :key="item.id" class="suite__item">
      <component
        :is="getComponent(item.componentType)"
        :ref="makeItemRefSetter(item.id)"
        v-bind="getComponentProps(item)"
        @progress-change="onItemProgressChange(item.id, $event)"
        @state-change="onItemStateChange(item.id, item.componentType, $event)"
      />
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { testComponentMap } from './test-component-map'
import type { TestComponentConfig } from '../types/test-config'
import type {
  ChooseCorrectAnswerState,
  FillInTheBlankState,
  MatchPairsState,
  StatefulTestComponentHandle,
  TestComponentState,
  TestComponentStateEnvelope,
  TestSuiteContainerHandle,
  TestSuiteState,
  YesNoQuestionsState,
} from '../types/test-state'

interface Props {
  items: TestComponentConfig[]
  initialState?: TestSuiteState
}

interface ProgressPayload {
  completed: number
  total: number
  correctChecked: number
  checked: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'state-change', payload: TestSuiteState): void
}>()
const progressByItemId = reactive<Record<string, ProgressPayload>>({})
const stateByItemId = reactive<Record<string, TestComponentStateEnvelope>>({})
const itemHandles = reactive<Record<string, StatefulTestComponentHandle | undefined>>({})
const initialStateAppliedByItemId = reactive<Record<string, boolean>>({})
const itemRefSetters: Record<string, (element: Element | ComponentPublicInstance | null) => void> = {}

const getComponent = (type: TestComponentConfig['componentType']) => testComponentMap[type]
const getItemTotal = (item: TestComponentConfig): number => {
  if (item.componentType === 'choose-correct-answer') return item.questions.length
  if (item.componentType === 'fill-in-the-blank') return item.texts.length
  return item.tasks.length
}
const getFallbackProgress = (item: TestComponentConfig): ProgressPayload => ({
  completed: 0,
  total: getItemTotal(item),
  correctChecked: 0,
  checked: 0,
})
const onItemProgressChange = (itemId: string, payload: ProgressPayload): void => {
  progressByItemId[itemId] = payload
}
const createEmptyStateForItem = (item: TestComponentConfig): TestComponentState => {
  if (item.componentType === 'choose-correct-answer') {
    const state: ChooseCorrectAnswerState = {
      selectedAnswers: {},
      checkMode: false,
      showAnswersMode: false,
    }
    return state
  }
  if (item.componentType === 'fill-in-the-blank') {
    const state: FillInTheBlankState = {
      userAnswers: {},
      checkMode: false,
      showAnswersMode: false,
    }
    return state
  }
  if (item.componentType === 'match-pairs') {
    const state: MatchPairsState = {
      assignments: {},
      checkMode: false,
      showAnswersMode: false,
    }
    return state
  }
  const state: YesNoQuestionsState = {
    selectedAnswers: {},
    checkMode: false,
    showAnswersMode: false,
  }
  return state
}
const createFallbackStateEnvelope = (item: TestComponentConfig): TestComponentStateEnvelope => ({
  componentType: item.componentType,
  state: createEmptyStateForItem(item),
})
const getInitialStateEnvelope = (item: TestComponentConfig): TestComponentStateEnvelope => {
  const incoming = props.initialState?.items?.[item.id]
  if (!incoming || incoming.componentType !== item.componentType) return createFallbackStateEnvelope(item)
  return incoming
}
const onItemStateChange = (itemId: string, componentType: TestComponentConfig['componentType'], state: TestComponentState): void => {
  stateByItemId[itemId] = {
    componentType,
    state,
  }
}
const setItemRef = (itemId: string, element: unknown): void => {
  if (!element) {
    itemHandles[itemId] = undefined
    return
  }
  const handle = element as StatefulTestComponentHandle
  itemHandles[itemId] = handle
  const item = props.items.find((entry) => entry.id === itemId)
  const initialEnvelope = props.initialState?.items?.[itemId]
  if (
    item &&
    initialEnvelope &&
    initialEnvelope.componentType === item.componentType &&
    !initialStateAppliedByItemId[itemId]
  ) {
    handle.setState(initialEnvelope.state)
    initialStateAppliedByItemId[itemId] = true
  }
}
const makeItemRefSetter = (itemId: string): ((element: Element | ComponentPublicInstance | null) => void) => {
  if (!itemRefSetters[itemId]) {
    itemRefSetters[itemId] = (element: Element | ComponentPublicInstance | null): void => {
      setItemRef(itemId, element)
    }
  }
  return itemRefSetters[itemId]
}
watch(
  () => props.items,
  (items) => {
    const activeIds = new Set(items.map((item) => item.id))
    Object.keys(progressByItemId).forEach((id) => {
      if (!activeIds.has(id)) delete progressByItemId[id]
    })
    Object.keys(stateByItemId).forEach((id) => {
      if (!activeIds.has(id)) delete stateByItemId[id]
    })
    Object.keys(itemHandles).forEach((id) => {
      if (!activeIds.has(id)) delete itemHandles[id]
    })
    Object.keys(initialStateAppliedByItemId).forEach((id) => {
      if (!activeIds.has(id)) delete initialStateAppliedByItemId[id]
    })
    Object.keys(itemRefSetters).forEach((id) => {
      if (!activeIds.has(id)) delete itemRefSetters[id]
    })
    items.forEach((item) => {
      if (!progressByItemId[item.id]) {
        progressByItemId[item.id] = getFallbackProgress(item)
      }
      if (!stateByItemId[item.id]) {
        stateByItemId[item.id] = getInitialStateEnvelope(item)
      }
    })
  },
  { immediate: true },
)
watch(
  () => props.initialState,
  (nextState) => {
    if (!nextState) return
    props.items.forEach((item) => {
      const nextItemState = nextState.items[item.id]
      const handle = itemHandles[item.id]
      if (!nextItemState || !handle || nextItemState.componentType !== item.componentType) return
      handle.setState(nextItemState.state)
    })
  },
  { deep: true },
)
const totalItemsCount = computed(() =>
  props.items.reduce((acc, item) => acc + (progressByItemId[item.id] ?? getFallbackProgress(item)).total, 0),
)
const completedItemsCount = computed(() =>
  props.items.reduce((acc, item) => acc + (progressByItemId[item.id] ?? getFallbackProgress(item)).completed, 0),
)
const checkedItemsCount = computed(() =>
  props.items.reduce((acc, item) => acc + (progressByItemId[item.id] ?? getFallbackProgress(item)).checked, 0),
)
const correctCheckedItemsCount = computed(() =>
  props.items.reduce((acc, item) => acc + (progressByItemId[item.id] ?? getFallbackProgress(item)).correctChecked, 0),
)
const progressPercent = computed(() => {
  if (totalItemsCount.value === 0) return 0
  return Math.round((completedItemsCount.value / totalItemsCount.value) * 100)
})
const getState = (): TestSuiteState => ({
  items: Object.fromEntries(
    props.items.map((item) => {
      const fallbackEnvelope = createFallbackStateEnvelope(item)
      const handle = itemHandles[item.id]
      const currentState = handle?.getState() ?? stateByItemId[item.id]?.state ?? fallbackEnvelope.state
      return [
        item.id,
        {
          componentType: item.componentType,
          state: currentState,
        } as TestComponentStateEnvelope,
      ]
    }),
  ),
})
const setState = (state: unknown): void => {
  const rawState = (state ?? {}) as Partial<TestSuiteState>
  props.items.forEach((item) => {
    const nextEnvelope = rawState.items?.[item.id]
    const nextState =
      nextEnvelope && nextEnvelope.componentType === item.componentType
        ? nextEnvelope.state
        : createFallbackStateEnvelope(item).state
    itemHandles[item.id]?.setState(nextState)
  })
}
watch(
  [stateByItemId, () => props.items],
  () => {
    emit('state-change', getState())
  },
  { immediate: true, deep: true },
)
defineExpose<TestSuiteContainerHandle>({ getState, setState })

const getComponentProps = (item: TestComponentConfig): Record<string, unknown> => {
  if (item.componentType === 'choose-correct-answer') {
    return {
      title: item.title,
      descriptionMarkdown: item.descriptionMarkdown,
      showProgress: false,
      answerLayout: item.answerLayout,
      answerLayoutHeuristics: item.answerLayoutHeuristics,
      questions: item.questions,
    }
  }
  if (item.componentType === 'fill-in-the-blank') {
    return {
      title: item.title,
      descriptionMarkdown: item.descriptionMarkdown,
      showProgress: false,
      texts: item.texts,
    }
  }
  if (item.componentType === 'yes-no-questions') {
    return {
      title: item.title,
      descriptionMarkdown: item.descriptionMarkdown,
      showProgress: false,
      tasks: item.tasks,
    }
  }
  return {
    title: item.title,
    descriptionMarkdown: item.descriptionMarkdown,
    showProgress: false,
    tasks: item.tasks,
  }
}
</script>

<style scoped>
.suite {
  display: grid;
  gap: 1rem;
}
.suite__progress { display: grid; gap: 0.35rem; }
.suite__progress-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem; }
.suite__progress-label { margin: 0; color: var(--lt-color-text-muted, #334155); }
.suite__progress-stats { margin: 0; color: var(--lt-color-text-muted, #334155); }
.suite__progress-track {
  width: 100%;
  height: 0.6rem;
  border-radius: 999px;
  background: var(--lt-color-progress-track, #e5e7eb);
  overflow: hidden;
}
.suite__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--lt-color-progress-fill, #2f6feb);
  transition: width 0.2s ease;
}

.suite__item {
  background: var(--lt-color-container-item-bg, transparent);
}
</style>
