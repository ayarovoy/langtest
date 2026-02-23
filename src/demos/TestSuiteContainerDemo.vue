<template>
  <section class="demo-suite">
    <TestSuiteContainer
      ref="suiteRef"
      :items="items"
      :initial-state="initialState"
      @state-change="onStateChange"
    />
    <div class="demo-suite__actions">
      <button type="button" class="demo-suite__button" @click="clearPersistedState">
        Очистить сохраненное состояние
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import suiteConfig from '../data/synthetic-suite.json'
import type { TestComponentConfig, TestSuiteContainerHandle, TestSuiteState } from '../index'

const items = suiteConfig as TestComponentConfig[]
const storageKey = 'langtest:demo:test-suite-state'
const suiteRef = ref<TestSuiteContainerHandle>()
const isReadyToPersist = ref(false)

const loadInitialState = (): TestSuiteState | undefined => {
  if (typeof window === 'undefined') return undefined
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as TestSuiteState
  } catch {
    return undefined
  }
}
const initialState = ref<TestSuiteState | undefined>(loadInitialState())
onMounted(() => {
  isReadyToPersist.value = true
})
const onStateChange = (state: TestSuiteState): void => {
  if (typeof window === 'undefined' || !isReadyToPersist.value) return
  window.localStorage.setItem(storageKey, JSON.stringify(state))
}
const clearPersistedState = (): void => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(storageKey)
  initialState.value = undefined
  suiteRef.value?.setState(undefined)
}
</script>

<style scoped>
.demo-suite {
  display: grid;
  gap: 1rem;
}
.demo-suite__actions {
  display: flex;
}
.demo-suite__button {
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  border-radius: var(--lt-radius-control, 8px);
  padding: 0.45rem 0.8rem;
}
</style>
