<template>
  <MatchPairsTest :title="config.title" :tasks="config.tasks" />
</template>

<script setup lang="ts">
import importedTasks from '../data/synthetic-match-pairs.json'
import type { MatchPairsConfig } from '../index'

const config = importedTasks as MatchPairsConfig
</script>
