<script setup lang="ts">
import { useGameClient } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';

const client = useGameClient();
</script>

<template>
  <div class="action-buttons">
    <FancyButton
      v-for="action in client.ui.globalActions"
      :key="action.id"
      :text="action.label"
      :variant="action.variant"
      :disabled="action.isDisabled"
      @click="action.onClick"
    />
  </div>
</template>

<style scoped lang="postcss">
.action-buttons {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  bottom: var(--size-3);
  right: var(--size-3);
  z-index: 2;
  align-items: center;
  & > * {
    width: 100%;
  }
}
</style>
