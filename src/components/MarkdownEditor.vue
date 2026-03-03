<template>
  <div class="markdown-editor">
    <div class="markdown-editor__toolbar">
      <el-radio-group v-model="mode" size="small">
        <el-radio-button value="text">Текст</el-radio-button>
        <el-radio-button value="wysiwyg">Предпросмотр</el-radio-button>
      </el-radio-group>
    </div>
    <div class="markdown-editor__panes" :class="{ 'markdown-editor__panes--split': mode === 'wysiwyg' }">
      <textarea
        :value="modelValue"
        class="markdown-editor__textarea"
        :placeholder="placeholder"
        spellcheck="false"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
      <div
        v-show="mode === 'wysiwyg'"
        class="markdown-editor__preview"
        v-html="renderedMarkdown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { renderMarkdown } from '../utils/markdown'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const mode = ref<'text' | 'wysiwyg'>('text')
const renderedMarkdown = computed(() => renderMarkdown(props.modelValue ?? ''))
</script>

<style scoped>
.markdown-editor {
  display: grid;
  gap: 0.35rem;
}

.markdown-editor__toolbar {
  display: flex;
}

.markdown-editor__panes {
  display: grid;
  min-height: 120px;
}

.markdown-editor__panes--split {
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.markdown-editor__textarea {
  width: 100%;
  min-height: 120px;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--lt-color-input-border, #9ca3af);
  border-radius: var(--lt-radius-control, 8px);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-field-text, #111827);
  resize: vertical;
}

.markdown-editor__preview {
  min-height: 120px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--lt-color-input-border, #9ca3af);
  border-radius: var(--lt-radius-control, 8px);
  background: var(--lt-color-card-bg, #f8fafc);
  font-size: 0.9rem;
  line-height: 1.5;
  overflow-y: auto;
}

.markdown-editor__preview :deep(p) { margin: 0 0 0.5em; }
.markdown-editor__preview :deep(p:last-child) { margin-bottom: 0; }
.markdown-editor__preview :deep(ul) { margin: 0.25em 0; padding-left: 1.25em; }
.markdown-editor__preview :deep(h3) { margin: 0.5em 0 0.25em; font-size: 1.1em; }
.markdown-editor__preview :deep(h4) { margin: 0.5em 0 0.25em; font-size: 1em; }
.markdown-editor__preview :deep(h5) { margin: 0.5em 0 0.25em; font-size: 0.95em; }
.markdown-editor__preview :deep(code) { font-family: inherit; background: rgba(0,0,0,0.06); padding: 0.1em 0.3em; border-radius: 4px; }
</style>
