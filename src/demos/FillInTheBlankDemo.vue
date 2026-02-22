<template>
  <FillInTheBlankTest :title="config.title" :texts="config.texts" />
</template>

<script setup lang="ts">
import FillInTheBlankTest from '../components/FillInTheBlankTest.vue'
import importedTasks from '../data/synthetic-fill-in-the-blank.json'
import type { FillInTheBlankConfig } from '../types/test-config'

const config = importedTasks as FillInTheBlankConfig
</script>
