<script setup lang="ts">
const props = defineProps<{}>();
const emit = defineEmits<{}>();
</script>

<template>
  <div class="card-back" />
</template>

<style scoped lang="postcss">
.card-back {
  background: url('/assets/ui/card-back5.png') no-repeat center center;
  background-size: cover;
}
</style>
