<template>
  <YesNoQuestionsTest :title="config.title" :tasks="config.tasks" />
</template>

<script setup lang="ts">
import importedTasks from '../data/synthetic-yes-no-questions.json'
import type { YesNoQuestionsConfig } from '../index'

const config = importedTasks as YesNoQuestionsConfig
</script>
