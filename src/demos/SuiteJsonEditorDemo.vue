<template>
  <section class="suite-editor-demo">
    <div class="suite-editor-demo__actions">
      <el-button type="primary" @click="onPreview">
        Предпросмотр
      </el-button>
      <el-button type="success" @click="onExport">
        Выгрузить JSON
      </el-button>
    </div>

    <SuiteJsonEditor
      ref="editorRef"
      v-model="items"
    />

    <el-dialog
      v-model="previewDialogVisible"
      title="Предпросмотр"
      width="90%"
      draggable
      overflow
      destroy-on-close
      class="suite-editor-demo__dialog"
    >
      <div
        v-if="items.length === 0"
        class="suite-editor-demo__empty"
      >
        Нет компонентов для предпросмотра. Добавьте компоненты в редакторе.
      </div>
      <div
        v-else
        class="suite-editor-demo__preview-wrapper"
      >
        <TestSuiteContainer :items="items" />
      </div>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SuiteJsonEditor from '../components/SuiteJsonEditor.vue'
import TestSuiteContainer from '../components/TestSuiteContainer.vue'
import suiteConfig from '../data/synthetic-suite.json'
import type { TestComponentConfig } from '../types/test-config'

const items = ref<TestComponentConfig[]>(suiteConfig as TestComponentConfig[])
const editorRef = ref<InstanceType<typeof SuiteJsonEditor>>()
const previewDialogVisible = ref(false)

const onPreview = (): void => {
  previewDialogVisible.value = true
}

const onExport = (): void => {
  const json = editorRef.value?.getJson()
  if (!json) return
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `suite-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.suite-editor-demo {
  display: grid;
  gap: 1rem;
}

.suite-editor-demo__actions {
  display: flex;
  gap: 0.5rem;
}

.suite-editor-demo__dialog :deep(.el-dialog) {
  resize: both;
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: 75vh;
  min-width: 400px;
  min-height: 300px;
  max-width: 95vw;
  max-height: 90vh;
}

.suite-editor-demo__dialog :deep(.el-dialog__header) {
  flex-shrink: 0;
  cursor: move;
  user-select: none;
}

.suite-editor-demo__dialog :deep(.el-dialog__body) {
  padding: 0;
  margin-right: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.suite-editor-demo__preview-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px;
}

.suite-editor-demo__empty {
  padding: 2rem;
  text-align: center;
  color: var(--lt-color-text-muted, #334155);
}
</style>
