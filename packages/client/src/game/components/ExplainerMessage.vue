<script setup lang="ts">
import { useGameClient } from '../composables/useGameClient';

const client = useGameClient();
</script>

<template>
  <p class="surface explainer-message" v-if="client.ui.explainerMessage">
    {{ client.ui.explainerMessage }}
  </p>
</template>

<style scoped lang="postcss">
.explainer-message {
  margin-inline-start: var(--size-9);
  font-size: var(--font-size-5);
  color: #ffb270;
  letter-spacing: 0.25ch;
  transition: scale 0.5s var(--ease-elastic-1);
  @starting-style {
    scale: 0;
  }
}
</style>
