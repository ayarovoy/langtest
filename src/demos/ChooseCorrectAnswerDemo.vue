<template>
  <section class="choose-demo">
    <div class="choose-demo__layout-switcher">
      <span class="choose-demo__layout-label">Режим раскладки ответов</span>
      <div class="choose-demo__layout-buttons">
        <button
          v-for="mode in layoutModes"
          :key="mode.id"
          type="button"
          class="choose-demo__layout-btn"
          :class="{ 'choose-demo__layout-btn--active': selectedLayout === mode.id }"
          @click="selectedLayout = mode.id"
        >
          {{ mode.title }}
        </button>
      </div>
    </div>
    <ChooseCorrectAnswerTest
      :title="config.title"
      :description-markdown="config.descriptionMarkdown"
      :questions="config.questions"
      :answer-layout="selectedLayout"
      :answer-layout-heuristics="config.answerLayoutHeuristics"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import importedQuestions from '../data/synthetic-questions.json'
import type { AnswerLayoutMode, ChooseCorrectAnswerConfig } from '../index'

interface LayoutModeOption {
  id: AnswerLayoutMode
  title: string
}

interface ChooseCorrectAnswerDemoConfig extends ChooseCorrectAnswerConfig {
  demoLayoutModes?: LayoutModeOption[]
}

const config = importedQuestions as ChooseCorrectAnswerDemoConfig
const fallbackLayoutModes: LayoutModeOption[] = [
  { id: 'vertical', title: 'Вертикальная' },
  { id: 'horizontal', title: 'Горизонтальная' },
  { id: 'auto', title: 'Авто' },
]

const layoutModes = computed(() =>
  config.demoLayoutModes && config.demoLayoutModes.length > 0
    ? config.demoLayoutModes
    : fallbackLayoutModes,
)
const selectedLayout = ref<AnswerLayoutMode>(config.answerLayout ?? 'auto')
</script>

<style scoped>
.choose-demo {
  display: grid;
  gap: 0.85rem;
}

.choose-demo__layout-switcher {
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-card, 12px);
  padding: 0.85rem;
  background: var(--lt-color-card-bg, #fff);
}

.choose-demo__layout-label {
  display: block;
  margin-bottom: 0.55rem;
  color: var(--lt-color-text-secondary, #475569);
  font-size: 0.9rem;
}

.choose-demo__layout-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.choose-demo__layout-btn {
  border: 1px solid var(--lt-color-secondary-border, #d1d5db);
  border-radius: var(--lt-radius-control, 8px);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-secondary-text, #111827);
  padding: 0.45rem 0.75rem;
}

.choose-demo__layout-btn--active {
  border-color: var(--lt-color-primary, #2f6feb);
  box-shadow: 0 0 0 1px var(--lt-color-primary, #2f6feb) inset;
}
</style>
