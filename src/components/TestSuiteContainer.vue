<template>
  <section class="suite">
    <article v-for="item in items" :key="item.id" class="suite__item">
      <component :is="getComponent(item.componentType)" v-bind="getComponentProps(item)" />
    </article>
  </section>
</template>

<script setup lang="ts">
import { testComponentMap } from './test-component-map'
import type { TestComponentConfig } from '../types/test-config'

interface Props {
  items: TestComponentConfig[]
}

defineProps<Props>()

const getComponent = (type: TestComponentConfig['componentType']) => testComponentMap[type]

const getComponentProps = (item: TestComponentConfig): Record<string, unknown> => {
  if (item.componentType === 'choose-correct-answer') {
    return { title: item.title, descriptionMarkdown: item.descriptionMarkdown, questions: item.questions }
  }
  if (item.componentType === 'fill-in-the-blank') {
    return { title: item.title, descriptionMarkdown: item.descriptionMarkdown, texts: item.texts }
  }
  return { title: item.title, descriptionMarkdown: item.descriptionMarkdown, tasks: item.tasks }
}
</script>

<style scoped>
.suite {
  display: grid;
  gap: 1rem;
}

.suite__item {
  background: transparent;
}
</style>
