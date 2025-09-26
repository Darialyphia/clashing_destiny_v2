<script setup lang="ts">
import { useGameClient } from '../composables/useGameClient';

const client = useGameClient();
</script>

<template>
  <p
    class="explainer-message"
    :class="{
      displayed: !!client.ui.explainerMessage
    }"
  >
    {{ client.ui.explainerMessage || 'a' }}
  </p>
</template>

<style scoped lang="postcss">
.explainer-message {
  margin-inline-start: var(--size-9);
  font-size: var(--font-size-4);
  color: #ffb270;
  letter-spacing: 0.25ch;
  opacity: 0;
  text-align: center;
  &.displayed {
    opacity: 1;
  }
}
</style>
