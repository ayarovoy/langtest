<template>
  <ChooseCorrectAnswerTest :title="config.title" :questions="config.questions" />
</template>

<script setup lang="ts">
import importedQuestions from '../data/synthetic-questions.json'
import type { ChooseCorrectAnswerConfig } from '../index'

const config = importedQuestions as ChooseCorrectAnswerConfig
</script>
