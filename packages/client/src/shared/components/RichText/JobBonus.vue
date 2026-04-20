<script setup lang="ts">
const { job } = defineProps<{
  job: string;
}>();
</script>

<template>
  <rt-trigger color="green">{{ job }} Bonus</rt-trigger>
</template>
