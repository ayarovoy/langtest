<template>
  <div class="lab">
    <aside class="lab__sidebar">
      <h1 class="lab__title">LangTest: тестовая среда компонентов</h1>
      <p class="lab__subtitle">Единая среда для ручного тестирования всех компонентов.</p>

      <ul class="lab__list">
        <li v-for="entry in componentRegistry" :key="entry.id">
          <button
            class="lab__item-btn"
            :class="{ 'lab__item-btn--active': entry.id === selectedId }"
            type="button"
            @click="selectedId = entry.id"
          >
            <span class="lab__item-title">{{ entry.title }}</span>
            <span class="lab__item-desc">{{ entry.description }}</span>
          </button>
        </li>
      </ul>
    </aside>

    <main class="lab__preview">
      <component :is="selectedEntry.component" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { componentRegistry } from './componentRegistry'

const selectedId = ref(componentRegistry[0]?.id ?? '')
const selectedEntry = computed(
  () => componentRegistry.find((entry) => entry.id === selectedId.value) ?? componentRegistry[0],
)
</script>

<style scoped>
.lab {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 320px 1fr;
  background: #f7f9fc;
  color: #111827;
  font-family: Inter, Arial, sans-serif;
}

.lab__sidebar {
  border-right: 1px solid #e5e7eb;
  padding: 1rem;
  background: #fff;
}

.lab__title {
  margin: 0;
  font-size: 1.1rem;
}

.lab__subtitle {
  margin: 0.5rem 0 1rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.lab__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.lab__item-btn {
  width: 100%;
  text-align: left;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 10px;
  padding: 0.65rem;
  cursor: pointer;
}

.lab__item-btn--active {
  border-color: #2f6feb;
  box-shadow: 0 0 0 1px #2f6feb inset;
}

.lab__item-title {
  display: block;
  font-weight: 600;
}

.lab__item-desc {
  display: block;
  margin-top: 0.2rem;
  color: #6b7280;
  font-size: 0.85rem;
}

.lab__preview {
  padding: 1.25rem;
}
</style>
