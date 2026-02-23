<template>
  <TestSuiteContainer :items="items" />
</template>

<script setup lang="ts">
import suiteConfig from '../data/synthetic-suite.json'
import type { TestComponentConfig } from '../index'

const items = suiteConfig as TestComponentConfig[]
</script>
