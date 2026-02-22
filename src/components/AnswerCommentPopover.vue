<template>
  <span class="comment-popover">
    <button
      class="comment-popover__trigger"
      type="button"
      :aria-expanded="isOpen"
      aria-label="Показать комментарий к ответу"
      @click.stop="toggle"
    >
      ?
    </button>
    <div v-if="isOpen" class="comment-popover__panel" role="dialog">
      <div class="comment-popover__content" v-html="renderedComment"></div>
    </div>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '../utils/markdown'

interface Props {
  markdown: string
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ toggle: [] }>()
const renderedComment = computed(() => renderMarkdown(props.markdown))
const toggle = (): void => emit('toggle')
</script>

<style scoped>
.comment-popover { position: relative; display: inline-flex; align-items: center; margin-left: 0.35rem; }
.comment-popover__trigger {
  width: 1.2rem;
  height: 1.2rem;
  border: 1px solid #9ca3af;
  border-radius: 999px;
  background: #fff;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}
.comment-popover__panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.35rem);
  left: 0;
  width: min(320px, 75vw);
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
  padding: 0.55rem 0.65rem;
}
.comment-popover__content { color: #334155; font-size: 0.88rem; }
:deep(.comment-popover__content p) { margin: 0.25rem 0; }
:deep(.comment-popover__content ul) { margin: 0.25rem 0; padding-left: 1.1rem; }
:deep(.comment-popover__content h3),
:deep(.comment-popover__content h4),
:deep(.comment-popover__content h5) { margin: 0.25rem 0; font-size: 0.9rem; }
</style>
