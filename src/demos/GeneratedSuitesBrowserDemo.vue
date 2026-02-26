<template>
  <section class="generated-suites">
    <header class="generated-suites__header">
      <h2 class="generated-suites__title">Сгенерированные тесты</h2>
      <p class="generated-suites__subtitle">
        Выберите JSON-набор из <code>generator/fixtures/outputs</code> и пройдите тест прямо в контейнере.
      </p>
    </header>

    <div class="generated-suites__controls">
      <label class="generated-suites__label" for="suite-select">Набор</label>
      <select
        id="suite-select"
        v-model="selectedFileName"
        class="generated-suites__select"
        :disabled="isLoadingList || suiteList.length === 0"
      >
        <option value="" disabled>Выберите набор...</option>
        <option v-for="entry in suiteList" :key="entry.fileName" :value="entry.fileName">
          {{ entry.fileName }} ({{ entry.componentCount }} компонент(ов))
        </option>
      </select>
      <button type="button" class="generated-suites__btn" @click="loadList" :disabled="isLoadingList">
        Обновить список
      </button>
      <button
        type="button"
        class="generated-suites__btn generated-suites__btn--primary"
        @click="loadSelectedSuite"
        :disabled="!selectedFileName || isLoadingSuite"
      >
        Загрузить набор
      </button>
      <button
        type="button"
        class="generated-suites__btn"
        @click="clearPersistedStateForSelectedSuite"
        :disabled="!selectedFileName"
      >
        Сбросить прогресс набора
      </button>
    </div>

    <p v-if="listError" class="generated-suites__error">{{ listError }}</p>
    <p v-if="suiteError" class="generated-suites__error">{{ suiteError }}</p>
    <p v-if="isLoadingSuite" class="generated-suites__hint">Загружаем тестовый набор...</p>

    <div v-if="loadedItems.length > 0" class="generated-suites__suite">
      <TestSuiteContainer
        :key="suiteRenderKey"
        :items="loadedItems"
        :initial-state="initialState"
        @state-change="onStateChange"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { TestComponentConfig } from '../types/test-config'
import type { TestSuiteState } from '../types/test-state'

interface GeneratedSuiteEntry {
  fileName: string
  componentCount: number
  updatedAt: string
}

const suiteList = ref<GeneratedSuiteEntry[]>([])
const selectedFileName = ref('')
const loadedItems = ref<TestComponentConfig[]>([])
const initialState = ref<TestSuiteState | undefined>(undefined)
const suiteRenderKey = ref('suite-render:empty')
const isLoadingList = ref(false)
const isLoadingSuite = ref(false)
const listError = ref('')
const suiteError = ref('')

const storagePrefix = 'langtest:generated-suite-state:'

const makeStorageKey = (fileName: string): string => `${storagePrefix}${fileName}`
const loadPersistedState = (fileName: string): TestSuiteState | undefined => {
  if (typeof window === 'undefined' || !fileName) return undefined
  const raw = window.localStorage.getItem(makeStorageKey(fileName))
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as TestSuiteState
  } catch {
    return undefined
  }
}

const onStateChange = (state: TestSuiteState): void => {
  if (typeof window === 'undefined' || !selectedFileName.value) return
  window.localStorage.setItem(makeStorageKey(selectedFileName.value), JSON.stringify(state))
}

const loadList = async (): Promise<void> => {
  isLoadingList.value = true
  listError.value = ''
  try {
    const response = await fetch('/api/generated-suites')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const payload = (await response.json()) as GeneratedSuiteEntry[]
    suiteList.value = payload
    if (!selectedFileName.value && payload.length > 0) {
      selectedFileName.value = payload[0].fileName
    }
  } catch (error) {
    listError.value = `Не удалось загрузить список наборов: ${String(error)}`
  } finally {
    isLoadingList.value = false
  }
}

const loadSelectedSuite = async (): Promise<void> => {
  if (!selectedFileName.value) return
  isLoadingSuite.value = true
  suiteError.value = ''
  try {
    const response = await fetch(`/api/generated-suites/${encodeURIComponent(selectedFileName.value)}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const payload = (await response.json()) as TestComponentConfig[]
    loadedItems.value = payload
    initialState.value = loadPersistedState(selectedFileName.value)
    suiteRenderKey.value = `suite-render:${selectedFileName.value}:${Date.now()}`
  } catch (error) {
    suiteError.value = `Не удалось загрузить набор ${selectedFileName.value}: ${String(error)}`
    loadedItems.value = []
    initialState.value = undefined
  } finally {
    isLoadingSuite.value = false
  }
}

const clearPersistedStateForSelectedSuite = (): void => {
  if (typeof window === 'undefined' || !selectedFileName.value) return
  window.localStorage.removeItem(makeStorageKey(selectedFileName.value))
  initialState.value = undefined
  if (loadedItems.value.length > 0) {
    suiteRenderKey.value = `suite-render:${selectedFileName.value}:${Date.now()}`
  }
}

onMounted(async () => {
  await loadList()
  if (selectedFileName.value) {
    await loadSelectedSuite()
  }
})
</script>

<style scoped>
.generated-suites {
  display: grid;
  gap: 1rem;
}

.generated-suites__header {
  display: grid;
  gap: 0.3rem;
}

.generated-suites__title {
  margin: 0;
}

.generated-suites__subtitle {
  margin: 0;
  color: var(--lt-color-text-muted, #334155);
}

.generated-suites__controls {
  display: grid;
  grid-template-columns: auto minmax(280px, 520px) auto auto;
  gap: 0.5rem;
  align-items: center;
}

.generated-suites__label {
  font-weight: 600;
}

.generated-suites__select {
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.5rem 0.65rem;
  color: var(--lt-color-field-text, #111827);
  background: var(--lt-color-secondary-bg, #fff);
}

.generated-suites__btn {
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  border-radius: var(--lt-radius-control, 8px);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  padding: 0.5rem 0.7rem;
  cursor: pointer;
}

.generated-suites__btn--primary {
  background: var(--lt-color-primary, #2f6feb);
  color: var(--lt-color-primary-contrast, #fff);
  border-color: var(--lt-color-primary, #2f6feb);
}

.generated-suites__error {
  margin: 0;
  color: var(--lt-color-incorrect-text, #9f1239);
}

.generated-suites__hint {
  margin: 0;
  color: var(--lt-color-text-muted, #334155);
}
</style>
