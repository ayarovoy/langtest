<template>
  <MatchPairsTest title="Демо: сопоставь одно с другим" :tasks="tasks" />
</template>

<script setup lang="ts">
import MatchPairsTest, { type MatchTask } from '../components/MatchPairsTest.vue'
import importedTasks from '../data/synthetic-match-pairs.json'

const tasks = importedTasks as MatchTask[]
</script>
