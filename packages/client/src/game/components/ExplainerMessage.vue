<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';

const ui = useGameUi();
</script>

<template>
  <p
    class="explainer-message"
    :class="{
      displayed: !!ui.explainerMessage
    }"
  >
    {{ ui.explainerMessage || 'a' }}
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
  padding-block: var(--size-3);
  &.displayed {
    opacity: 1;
  }
}
</style>
