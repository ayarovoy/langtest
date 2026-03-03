<template>
  <div class="suite-json-editor">
    <div class="suite-json-editor__toolbar">
      <div class="suite-json-editor__undo-redo">
        <el-button
          size="small"
          :disabled="!canUndo"
          @click="undo"
        >
          Отменить
        </el-button>
        <el-button
          size="small"
          :disabled="!canRedo"
          @click="redo"
        >
          Повторить
        </el-button>
      </div>
      <span class="suite-json-editor__label">Тип компонента:</span>
      <el-select
        v-model="newComponentType"
        placeholder="Выберите тип"
        size="default"
        class="suite-json-editor__select"
      >
        <el-option
          v-for="t in componentTypes"
          :key="t"
          :label="formatComponentTypeLabel(t)"
          :value="t"
        />
      </el-select>
      <el-button type="primary" :disabled="!newComponentType" @click="addComponent">
        Добавить компонент
      </el-button>
    </div>

    <el-collapse v-model="activeNames" class="suite-json-editor__collapse">
      <el-collapse-item
        v-for="(item, index) in items"
        :key="item.id"
        :name="item.id"
      >
        <template #title>
          <div
            class="suite-json-editor__header"
            :class="{ 'suite-json-editor__header--drag-over': draggedOverComponentIndex === index }"
            @dragenter.prevent="onComponentDragOver(index)"
            @dragover.prevent
            @dragleave="onComponentDragLeave(index, $event)"
            @drop.stop="onComponentDrop(index)"
          >
            <span
              class="suite-json-editor__drag-handle"
              title="Перетащите для изменения порядка"
              draggable="true"
              @click.stop
              @dragstart.stop="onComponentDragStart(index, $event)"
              @dragend="onComponentDragEnd"
            >
              ⋮⋮
            </span>
            <input
              :value="titleDraftByKey[item.id] ?? item.title ?? ''"
              class="suite-json-editor__title-input"
              :placeholder="`${formatComponentTypeLabel(item.componentType)} • ${item.id}`"
              title="Нажмите для редактирования"
              @input="onTitleInput(item.id, ($event.target as HTMLInputElement).value)"
              @blur="onTitleBlur(item.id, ($event.target as HTMLInputElement).value)"
              @click.stop
            />
            <div class="suite-json-editor__actions">
              <el-button
                size="small"
                type="danger"
                class="suite-json-editor__delete-button"
                title="Удалить компонент"
                @click.stop="removeComponent(index)"
              >
                🗑
              </el-button>
            </div>
          </div>
        </template>
        <div class="suite-json-editor__body">
          <ChooseCorrectAnswerEditor
            v-if="item.componentType === 'choose-correct-answer'"
            :model-value="item"
            @update:model-value="onChooseCorrectAnswerUpdate(index, $event)"
          />
          <FillInTheBlankEditor
            v-else-if="item.componentType === 'fill-in-the-blank'"
            :model-value="item"
            @update:model-value="onFillInTheBlankUpdate(index, $event)"
          />
          <template v-else>
            <textarea
              v-model="localJsonByKey[item.id]"
              class="suite-json-editor__textarea"
              :class="{ 'suite-json-editor__textarea--error': jsonErrorByKey[item.id] }"
              spellcheck="false"
              @blur="onBlur(item.id)"
              @input="onInput(item.id)"
            />
            <p v-if="jsonErrorByKey[item.id]" class="suite-json-editor__error">
              {{ jsonErrorByKey[item.id] }}
            </p>
          </template>
        </div>
      </el-collapse-item>
    </el-collapse>

    <p v-if="items.length === 0" class="suite-json-editor__empty">
      Нет компонентов. Добавьте компонент с помощью кнопки выше.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import ChooseCorrectAnswerEditor from './editors/ChooseCorrectAnswerEditor.vue'
import FillInTheBlankEditor from './editors/FillInTheBlankEditor.vue'
import type {
  ChooseCorrectAnswerConfig,
  FillInTheBlankConfig,
  TestComponentConfig,
  TestComponentType,
} from '../types/test-config'

const componentTypes: TestComponentType[] = [
  'choose-correct-answer',
  'fill-in-the-blank',
  'match-pairs',
  'yes-no-questions',
]

const props = defineProps<{
  modelValue?: TestComponentConfig[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TestComponentConfig[]): void
}>()

const MAX_HISTORY = 50
const items = ref<TestComponentConfig[]>([])
const historyUndo = ref<TestComponentConfig[][]>([])
const historyRedo = ref<TestComponentConfig[][]>([])
const isUndoRedoInProgress = ref(false)
const activeNames = ref<string[]>([])
const newComponentType = ref<TestComponentType | ''>('')
const localJsonByKey = reactive<Record<string, string>>({})
const jsonErrorByKey = reactive<Record<string, string>>({})
const titleDraftByKey = reactive<Record<string, string>>({})
const draggedComponentIndex = ref<number | null>(null)
const draggedOverComponentIndex = ref<number | null>(null)

const canUndo = computed(() => historyUndo.value.length > 0)
const canRedo = computed(() => historyRedo.value.length > 0)

const snapshot = (): TestComponentConfig[] => JSON.parse(JSON.stringify(items.value))
const snapshotsEqual = (a: TestComponentConfig[], b: TestComponentConfig[]): boolean =>
  JSON.stringify(a) === JSON.stringify(b)

const pushUndo = (): void => {
  if (isUndoRedoInProgress.value) return
  const state = snapshot()
  historyUndo.value.push(state)
  if (historyUndo.value.length > MAX_HISTORY) historyUndo.value.shift()
  historyRedo.value = []
}

const genId = (): string => `comp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const stubs: Record<TestComponentType, () => TestComponentConfig> = {
  'choose-correct-answer': () => ({
    id: genId(),
    componentType: 'choose-correct-answer',
    title: '',
    questions: [],
  }),
  'fill-in-the-blank': () => ({
    id: genId(),
    componentType: 'fill-in-the-blank',
    title: '',
    texts: [],
  }),
  'match-pairs': () => ({
    id: genId(),
    componentType: 'match-pairs',
    title: '',
    tasks: [],
  }),
  'yes-no-questions': () => ({
    id: genId(),
    componentType: 'yes-no-questions',
    title: '',
    tasks: [],
  }),
}

const formatComponentTypeLabel = (t: TestComponentType): string => {
  const labels: Record<TestComponentType, string> = {
    'choose-correct-answer': 'Выбери правильный ответ',
    'fill-in-the-blank': 'Заполни пропуск',
    'match-pairs': 'Сопоставь пары',
    'yes-no-questions': 'Вопросы ДА/НЕТ',
  }
  return labels[t] ?? t
}

const syncItemsFromProp = (): void => {
  const incoming = props.modelValue
  const nextItems = Array.isArray(incoming) && incoming.length > 0
    ? JSON.parse(JSON.stringify(incoming))
    : []
  const isExternalChange = !snapshotsEqual(items.value, nextItems)
  items.value = nextItems
  if (isExternalChange) {
    historyUndo.value = []
    historyRedo.value = []
  }
  syncLocalJsonFromItems()
}

const itemJsonWithoutTitle = (item: TestComponentConfig): string => {
  const obj = { ...item }
  delete (obj as Record<string, unknown>).title
  return JSON.stringify(obj, null, 2)
}

const syncLocalJsonFromItems = (): void => {
  const ids = new Set(items.value.map((i) => i.id))
  for (const id of Object.keys(localJsonByKey)) {
    if (!ids.has(id)) {
      delete localJsonByKey[id]
      delete jsonErrorByKey[id]
      delete titleDraftByKey[id]
    }
  }
  for (const item of items.value) {
    if (item.componentType !== 'choose-correct-answer' && item.componentType !== 'fill-in-the-blank') {
      localJsonByKey[item.id] = itemJsonWithoutTitle(item)
    } else {
      delete localJsonByKey[item.id]
    }
    delete jsonErrorByKey[item.id]
  }
}

watch(
  () => props.modelValue,
  () => syncItemsFromProp(),
  { immediate: true },
)

const emitItems = (): void => {
  emit('update:modelValue', JSON.parse(JSON.stringify(items.value)))
}

const undo = (): void => {
  if (historyUndo.value.length === 0) return
  isUndoRedoInProgress.value = true
  historyRedo.value.push(snapshot())
  const prev = historyUndo.value.pop()!
  items.value = prev
  syncLocalJsonFromItems()
  emitItems()
  isUndoRedoInProgress.value = false
}

const redo = (): void => {
  if (historyRedo.value.length === 0) return
  isUndoRedoInProgress.value = true
  historyUndo.value.push(snapshot())
  const next = historyRedo.value.pop()!
  items.value = next
  syncLocalJsonFromItems()
  emitItems()
  isUndoRedoInProgress.value = false
}

const tryParseItem = (id: string, raw: string): TestComponentConfig | null => {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && 'id' in parsed && 'componentType' in parsed) {
      return parsed as TestComponentConfig
    }
    return null
  } catch {
    return null
  }
}

const onTitleInput = (id: string, value: string): void => {
  titleDraftByKey[id] = value
}

const onChooseCorrectAnswerUpdate = (index: number, payload: ChooseCorrectAnswerConfig): void => {
  if (!snapshotsEqual([items.value[index]], [payload])) {
    pushUndo()
  }
  items.value[index] = payload
  emitItems()
}

const onFillInTheBlankUpdate = (index: number, payload: FillInTheBlankConfig): void => {
  if (!snapshotsEqual([items.value[index]], [payload])) {
    pushUndo()
  }
  items.value[index] = payload
  emitItems()
}

const onTitleBlur = (id: string, value: string): void => {
  const idx = items.value.findIndex((i) => i.id === id)
  if (idx < 0) return
  const currentTitle = items.value[idx].title ?? ''
  const newTitle = value.trim()
  delete titleDraftByKey[id]
  if (newTitle !== currentTitle) {
    pushUndo()
    items.value[idx] = { ...items.value[idx], title: newTitle || undefined }
    if (
      items.value[idx].componentType !== 'choose-correct-answer'
      && items.value[idx].componentType !== 'fill-in-the-blank'
    ) {
      localJsonByKey[id] = itemJsonWithoutTitle(items.value[idx])
    }
    emitItems()
  }
}

const onBlur = (id: string): void => {
  const raw = localJsonByKey[id]
  if (!raw?.trim()) return
  const parsed = tryParseItem(id, raw)
  if (parsed) {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx >= 0) {
      parsed.title = items.value[idx].title
      if (!snapshotsEqual([items.value[idx]], [parsed])) {
        pushUndo()
      }
      const oldId = id
      items.value[idx] = parsed
      delete jsonErrorByKey[oldId]
      if (parsed.id !== oldId) {
        delete localJsonByKey[oldId]
      }
      localJsonByKey[parsed.id] = itemJsonWithoutTitle(parsed)
      emitItems()
    }
  } else {
    try {
      JSON.parse(raw)
    } catch (e) {
      jsonErrorByKey[id] = e instanceof Error ? e.message : 'Невалидный JSON'
    }
  }
}

const onInput = (id: string): void => {
  const raw = localJsonByKey[id]
  const parsed = tryParseItem(id, raw)
  if (parsed) {
    delete jsonErrorByKey[id]
  } else if (raw?.trim()) {
    try {
      JSON.parse(raw)
    } catch {
      jsonErrorByKey[id] = 'Невалидный JSON'
    }
  } else {
    delete jsonErrorByKey[id]
  }
}

const addComponent = (): void => {
  const type = newComponentType.value
  if (!type || !componentTypes.includes(type)) return
  pushUndo()
  const stub = stubs[type]()
  items.value.push(stub)
  if (stub.componentType !== 'choose-correct-answer' && stub.componentType !== 'fill-in-the-blank') {
    localJsonByKey[stub.id] = itemJsonWithoutTitle(stub)
  }
  activeNames.value = [...(activeNames.value || []), stub.id]
  emitItems()
}

const removeComponent = (index: number): void => {
  pushUndo()
  const removed = items.value[index]
  items.value.splice(index, 1)
  delete localJsonByKey[removed.id]
  delete jsonErrorByKey[removed.id]
  activeNames.value = activeNames.value.filter((n) => n !== removed.id)
  emitItems()
}

const onComponentDragStart = (index: number, event: DragEvent): void => {
  draggedComponentIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const onComponentDrop = (targetIndex: number): void => {
  const sourceIndex = draggedComponentIndex.value
  draggedOverComponentIndex.value = null
  if (sourceIndex === null || sourceIndex === targetIndex) return
  if (sourceIndex < 0 || sourceIndex >= items.value.length) return
  pushUndo()
  const next = [...items.value]
  const [moved] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, moved)
  items.value = next
  draggedComponentIndex.value = null
  emitItems()
}

const onComponentDragOver = (index: number): void => {
  if (draggedComponentIndex.value === null) return
  draggedOverComponentIndex.value = index
}

const onComponentDragLeave = (index: number, event: DragEvent): void => {
  const currentTarget = event.currentTarget as HTMLElement | null
  const relatedTarget = event.relatedTarget as Node | null
  if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) return
  if (draggedOverComponentIndex.value === index) {
    draggedOverComponentIndex.value = null
  }
}

const onComponentDragEnd = (): void => {
  draggedComponentIndex.value = null
  draggedOverComponentIndex.value = null
}

const getJson = (): string => {
  return JSON.stringify(items.value, null, 2)
}

defineExpose({ getJson })
</script>

<style scoped>
.suite-json-editor {
  display: grid;
  gap: 1rem;
}

.suite-json-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.suite-json-editor__undo-redo {
  display: flex;
  gap: 0.25rem;
  margin-right: 0.5rem;
}

.suite-json-editor__label {
  font-size: 0.9rem;
  color: var(--lt-color-text-muted, #334155);
}

.suite-json-editor__select {
  width: 220px;
}

.suite-json-editor__collapse {
  border: 1px solid var(--lt-color-card-border, #d7d7d7);
  border-radius: var(--lt-radius-card, 12px);
}

.suite-json-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  gap: 0.4rem;
  border-radius: 8px;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.suite-json-editor__header--drag-over {
  background: color-mix(in srgb, var(--lt-color-primary, #2f6feb) 10%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lt-color-primary, #2f6feb) 45%, transparent);
}

.suite-json-editor__drag-handle {
  user-select: none;
  cursor: grab;
  font-size: 1rem;
  line-height: 1;
  color: var(--lt-color-text-muted, #64748b);
}

.suite-json-editor__drag-handle:active {
  cursor: grabbing;
}

.suite-json-editor__title-input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-weight: 500;
  color: var(--lt-color-text-primary, #111827);
  background: transparent;
  border: 1px dashed transparent;
  border-radius: 4px;
  outline: none;
  padding: 0.25rem 0.5rem;
  cursor: text;
  transition: border-color 0.15s, background-color 0.15s;
}

.suite-json-editor__title-input:hover {
  border-color: var(--lt-color-input-border, #9ca3af);
  background: var(--lt-color-card-bg, #f8fafc);
}

.suite-json-editor__title-input:focus {
  outline: none;
  border-color: var(--lt-color-primary, #2f6feb);
  background: var(--lt-color-card-bg, #fff);
}

.suite-json-editor__title-input::placeholder {
  color: var(--lt-color-text-muted, #334155);
}

.suite-json-editor__actions {
  display: flex;
  gap: 0.25rem;
  margin-right: 1.5rem;
}

.suite-json-editor__delete-button {
  font-size: 1rem;
  line-height: 1;
  padding-left: 0.45rem;
  padding-right: 0.45rem;
}

.suite-json-editor__body {
  padding: 0.5rem;
}

.suite-json-editor__textarea {
  width: 100%;
  min-height: 180px;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  padding: 0.5rem;
  border: 1px solid var(--lt-color-input-border, #9ca3af);
  border-radius: var(--lt-radius-control, 8px);
  background: var(--lt-color-secondary-bg, #fff);
  color: var(--lt-color-field-text, #111827);
  resize: vertical;
}

.suite-json-editor__textarea--error {
  border-color: var(--lt-color-incorrect-border, #f1a1be);
  outline-color: var(--lt-color-incorrect-border, #f1a1be);
}

.suite-json-editor__error {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--lt-color-incorrect-text, #9f1239);
}

.suite-json-editor__empty {
  margin: 0;
  padding: 1rem;
  color: var(--lt-color-text-muted, #334155);
  font-size: 0.9rem;
}
</style>
