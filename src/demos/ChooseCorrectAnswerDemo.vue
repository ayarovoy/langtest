<template>
  <ChooseCorrectAnswerTest title="Демо: выбери правильный ответ" :questions="questions" />
</template>

<script setup lang="ts">
import ChooseCorrectAnswerTest, { type TestQuestion } from '../components/ChooseCorrectAnswerTest.vue'
import importedQuestions from '../data/synthetic-questions.json'

const questions = importedQuestions as TestQuestion[]
</script>
