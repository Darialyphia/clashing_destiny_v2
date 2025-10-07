<script setup lang="ts">
const { count } = defineProps<{ count: number }>();
</script>

<template>
  <div class="count">{{ count }}</div>
</template>

<style scoped lang="postcss">
.count {
  background: black;
  border-radius: 50%;
  width: var(--size-5);
  height: var(--size-5);
  display: grid;
  place-content: center;
  font-weight: bold;
  font-size: var(--font-size-1);
  color: #d7ad42;
  border: solid var(--border-size-1) #bb8225;
}
</style>
