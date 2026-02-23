<template>
  <FillInTheBlankTest :title="config.title" :texts="config.texts" />
</template>

<script setup lang="ts">
import importedTasks from '../data/synthetic-fill-in-the-blank.json'
import type { FillInTheBlankConfig } from '../index'

const config = importedTasks as FillInTheBlankConfig
</script>
