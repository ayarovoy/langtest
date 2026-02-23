<template>
  <TestSuiteContainer :items="items" />
</template>

<script setup lang="ts">
import suiteConfig from '../data/demo-es-a1a2-irregular-preterites-suite.json'
import type { TestComponentConfig } from '../index'

const items = suiteConfig as TestComponentConfig[]
</script>

