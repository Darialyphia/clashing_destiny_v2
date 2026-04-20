<script setup lang="ts">
const { lvl } = defineProps<{
  lvl: number;
}>();
</script>

<template>
  <rt-trigger color="blue">Level {{ lvl }} Bonus</rt-trigger>
</template>
