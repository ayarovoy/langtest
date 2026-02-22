<template>
  <FillInTheBlankTest title="Демо: заполни пропуск" :texts="tasks" />
</template>

<script setup lang="ts">
import FillInTheBlankTest, { type FillTextTask } from '../components/FillInTheBlankTest.vue'
import importedTasks from '../data/synthetic-fill-in-the-blank.json'

const tasks = importedTasks as FillTextTask[]
</script>
