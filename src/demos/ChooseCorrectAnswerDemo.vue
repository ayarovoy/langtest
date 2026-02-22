<template>
  <ChooseCorrectAnswerTest :title="config.title" :questions="config.questions" />
</template>

<script setup lang="ts">
import ChooseCorrectAnswerTest from '../components/ChooseCorrectAnswerTest.vue'
import importedQuestions from '../data/synthetic-questions.json'
import type { ChooseCorrectAnswerConfig } from '../types/test-config'

const config = importedQuestions as ChooseCorrectAnswerConfig
</script>
