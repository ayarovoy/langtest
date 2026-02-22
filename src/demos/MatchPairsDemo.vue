<template>
  <MatchPairsTest :title="config.title" :tasks="config.tasks" />
</template>

<script setup lang="ts">
import MatchPairsTest from '../components/MatchPairsTest.vue'
import importedTasks from '../data/synthetic-match-pairs.json'
import type { MatchPairsConfig } from '../types/test-config'

const config = importedTasks as MatchPairsConfig
</script>
