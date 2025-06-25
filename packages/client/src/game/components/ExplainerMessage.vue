<script setup lang="ts">
import { useGameClient } from '../composables/useGameClient';

const client = useGameClient();
</script>

<template>
  <p class="explainer-message">{{ client.ui.explainerMessage }}</p>
</template>

<style scoped lang="postcss">
.explainer-message {
  margin-inline-start: var(--size-9);
  transform: rotateX(-30deg);
  font-size: var(--font-size-5);
}
</style>
