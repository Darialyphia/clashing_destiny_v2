<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';

const ui = useGameUi();
</script>

<template>
  <div
    class="action-buttons"
    :class="{ 'ui-hidden': !ui.displayedElements.actionButtons }"
  >
    <FancyButton
      v-for="action in ui.globalActions"
      :key="action.id"
      :id="ui.DOMSelectors.actionButton(action.id).id"
      :text="action.label"
      :variant="action.variant"
      :disabled="action.isDisabled"
      @click="action.onClick"
    />
  </div>
</template>

<style scoped lang="postcss">
.action-buttons {
  display: flex;
  gap: var(--size-2);
  bottom: var(--size-3);
  justify-content: flex-end;
  right: var(--size-3);
  align-items: center;
  position: absolute;
  bottom: var(--size-6);
  right: var(--size-6);
  z-index: 1;
}
</style>
