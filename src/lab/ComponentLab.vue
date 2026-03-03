<template>
  <div class="lab" :class="`lab--${selectedTheme}`">
    <aside class="lab__sidebar">
      <h1 class="lab__title">LangTest: тестовая среда компонентов</h1>
      <p class="lab__subtitle">Единая среда для ручного тестирования всех компонентов.</p>
      <div class="lab__theme-switcher">
        <span class="lab__theme-label">Тема</span>
        <div class="lab__theme-buttons">
          <button
            v-for="theme in themes"
            :key="theme.id"
            type="button"
            class="lab__theme-btn"
            :class="{ 'lab__theme-btn--active': selectedTheme === theme.id }"
            @click="selectedTheme = theme.id"
          >
            {{ theme.title }}
          </button>
        </div>
      </div>

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
  </div>
  <main class="lab__preview" :class="`lab--${selectedTheme}`">
    <component :is="selectedEntry.component" />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { componentRegistry } from './componentRegistry'

type ThemeId = 'light' | 'deep-blue' | 'dark'

const themes: Array<{ id: ThemeId; title: string }> = [
  { id: 'light', title: 'Светлая' },
  { id: 'deep-blue', title: 'Темно-синяя' },
  { id: 'dark', title: 'Темная' },
]
const selectedTheme = ref<ThemeId>('light')
const selectedId = ref(componentRegistry[0]?.id ?? '')
const selectedEntry = computed(
  () => componentRegistry.find((entry) => entry.id === selectedId.value) ?? componentRegistry[0],
)
</script>

<style scoped>
.lab,
.lab__preview {
  --lt-color-primary: #2f6feb;
  --lt-color-primary-contrast: #ffffff;
  --lt-color-secondary-bg: #ffffff;
  --lt-color-secondary-border: #d1d5db;
  --lt-color-secondary-text: #111827;
  --lt-color-card-bg: #ffffff;
  --lt-color-card-border: #d7d7d7;
  --lt-color-text-primary: #111827;
  --lt-color-text-muted: #334155;
  --lt-color-text-secondary: #475569;
  --lt-color-correct-bg: #e8ffea;
  --lt-color-correct-border: #87d78b;
  --lt-color-correct-strong: #1f9d42;
  --lt-color-incorrect-bg: #ffe9f1;
  --lt-color-incorrect-border: #f1a1be;
  --lt-color-incorrect-text: #9f1239;
  --lt-color-input-border: #9ca3af;
  --lt-color-field-text: #111827;
  --lt-color-placeholder: #9ca3af;
  --lt-color-table-border: #e5e7eb;
  --lt-color-table-header-bg: #f8fafc;
  --lt-color-dropzone-border: #c5ccd8;
  --lt-color-popover-bg: #ffffff;
  --lt-color-popover-border: #d1d5db;
  --lt-color-popover-trigger-bg: #ffffff;
  --lt-color-popover-trigger-border: #9ca3af;
  --lt-color-popover-trigger-text: #334155;
  --lt-radius-card: 12px;
  --lt-radius-control: 8px;
  font-family: Inter, Arial, sans-serif;
}

.lab {
  background: var(--lab-bg, #f7f9fc);
  color: var(--lab-text, #111827);
}

.lab__sidebar {
  border-right: 1px solid var(--lab-sidebar-border, #e5e7eb);
  padding: 1rem;
  background: var(--lab-sidebar-bg, #fff);
}

.lab__title {
  margin: 0;
  font-size: 1.1rem;
}

.lab__subtitle {
  margin: 0.5rem 0 1rem;
  color: var(--lab-subtitle, #6b7280);
  font-size: 0.9rem;
}

.lab__theme-switcher {
  margin: 0 0 1rem;
}

.lab__theme-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.84rem;
  color: var(--lab-subtitle, #6b7280);
}

.lab__theme-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.35rem;
}

.lab__theme-btn {
  border: 1px solid var(--lab-item-border, #d1d5db);
  border-radius: 8px;
  background: var(--lab-item-bg, #fff);
  color: var(--lab-text, #111827);
  font-size: 0.78rem;
  padding: 0.35rem 0.45rem;
  cursor: pointer;
}

.lab__theme-btn--active {
  border-color: var(--lt-color-primary, #2f6feb);
  box-shadow: 0 0 0 1px var(--lt-color-primary, #2f6feb) inset;
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
  border: 1px solid var(--lab-item-border, #d1d5db);
  background: var(--lab-item-bg, #fff);
  color: var(--lab-text, #111827);
  border-radius: 10px;
  padding: 0.65rem;
  cursor: pointer;
}

.lab__item-btn--active {
  border-color: var(--lt-color-primary, #2f6feb);
  box-shadow: 0 0 0 1px var(--lt-color-primary, #2f6feb) inset;
}

.lab__item-title {
  display: block;
  font-weight: 600;
}

.lab__item-desc {
  display: block;
  margin-top: 0.2rem;
  color: var(--lab-subtitle, #6b7280);
  font-size: 0.85rem;
}

.lab__preview {
  padding: 1.25rem;
  background: var(--lab-bg, #f7f9fc);
  color: var(--lab-text, #111827);
}

.lab--light {
  --lab-bg: #f7f9fc;
  --lab-text: #111827;
  --lab-sidebar-bg: #ffffff;
  --lab-sidebar-border: #e5e7eb;
  --lab-item-bg: #ffffff;
  --lab-item-border: #d1d5db;
  --lab-subtitle: #6b7280;
}

.lab--deep-blue {
  --lab-bg: #0d1b3d;
  --lab-text: #dbe7ff;
  --lab-sidebar-bg: #142657;
  --lab-sidebar-border: #2b3f74;
  --lab-item-bg: #1b316d;
  --lab-item-border: #35539b;
  --lab-subtitle: #a7b8df;

  --lt-color-primary: #4c8fff;
  --lt-color-primary-contrast: #ffffff;
  --lt-color-secondary-bg: #223a79;
  --lt-color-secondary-border: #3f5ba5;
  --lt-color-secondary-text: #e4ecff;
  --lt-color-card-bg: #192f68;
  --lt-color-card-border: #3a569e;
  --lt-color-text-primary: #e8efff;
  --lt-color-text-muted: #dbe7ff;
  --lt-color-text-secondary: #bed0fa;
  --lt-color-correct-bg: #123d2c;
  --lt-color-correct-border: #2d9365;
  --lt-color-correct-strong: #72d7a4;
  --lt-color-incorrect-bg: #4a1f36;
  --lt-color-incorrect-border: #b35f87;
  --lt-color-incorrect-text: #ffc5dd;
  --lt-color-input-border: #6f87c3;
  --lt-color-field-text: #e8efff;
  --lt-color-placeholder: #a7b8df;
  --lt-color-table-border: #3d5391;
  --lt-color-table-header-bg: #27458b;
  --lt-color-dropzone-border: #6f87c3;
  --lt-color-popover-bg: #223a79;
  --lt-color-popover-border: #4a66ab;
  --lt-color-popover-trigger-bg: #223a79;
  --lt-color-popover-trigger-border: #88a3e4;
  --lt-color-popover-trigger-text: #e4ecff;
}

.lab--dark {
  --lab-bg: #111318;
  --lab-text: #e5e7eb;
  --lab-sidebar-bg: #161a22;
  --lab-sidebar-border: #2b3240;
  --lab-item-bg: #1b212c;
  --lab-item-border: #374151;
  --lab-subtitle: #9ca3af;

  --lt-color-primary: #60a5fa;
  --lt-color-primary-contrast: #0b1220;
  --lt-color-secondary-bg: #1f2937;
  --lt-color-secondary-border: #374151;
  --lt-color-secondary-text: #e5e7eb;
  --lt-color-card-bg: #111827;
  --lt-color-card-border: #374151;
  --lt-color-text-primary: #f3f4f6;
  --lt-color-text-muted: #d1d5db;
  --lt-color-text-secondary: #9ca3af;
  --lt-color-correct-bg: #102a1c;
  --lt-color-correct-border: #2f855a;
  --lt-color-correct-strong: #86efac;
  --lt-color-incorrect-bg: #3a1728;
  --lt-color-incorrect-border: #9f4368;
  --lt-color-incorrect-text: #f9a8d4;
  --lt-color-input-border: #6b7280;
  --lt-color-field-text: #f3f4f6;
  --lt-color-placeholder: #9ca3af;
  --lt-color-table-border: #334155;
  --lt-color-table-header-bg: #1f2937;
  --lt-color-dropzone-border: #64748b;
  --lt-color-popover-bg: #1f2937;
  --lt-color-popover-border: #374151;
  --lt-color-popover-trigger-bg: #1f2937;
  --lt-color-popover-trigger-border: #6b7280;
  --lt-color-popover-trigger-text: #e5e7eb;
}
</style>
