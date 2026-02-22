<template>
  <TestSuiteContainer :items="items" />
</template>

<script setup lang="ts">
import TestSuiteContainer from '../components/TestSuiteContainer.vue'
import suiteConfig from '../data/synthetic-suite.json'
import type { TestComponentConfig } from '../types/test-config'

const items = suiteConfig as TestComponentConfig[]
</script>
