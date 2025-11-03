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
  font-size: var(--font-size-3);
  color: #ffb270;
  letter-spacing: 0.25ch;
  opacity: 0;
  text-align: center;
  max-width: 40ch;
  padding-block: var(--size-3);
  text-wrap: balance;
  &.displayed {
    opacity: 1;
  }
}
</style>
