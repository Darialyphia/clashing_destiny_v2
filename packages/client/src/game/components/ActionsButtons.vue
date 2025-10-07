<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import { useGameUi } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
const ui = useGameUi();

const isSettingsOpened = ref(false);

useKeyboardControl(
  'keydown',
  {
    key: 'Escape',
    modifier: null
  },
  () => {
    isSettingsOpened.value = !isSettingsOpened.value;
  }
);
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
    <button
      aria-label="Settings"
      class="settings-button"
      @click="isSettingsOpened = true"
    />

    <UiModal
      v-model:is-opened="isSettingsOpened"
      title="Menu"
      description="Game settings"
      :style="{ '--ui-modal-size': 'var(--size-xs)' }"
    >
      <div class="game-board-menu">
        <FancyButton text="Close" @click="isSettingsOpened = false" />
        <slot />
      </div>
    </UiModal>
  </div>
</template>

<style scoped lang="postcss">
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  bottom: var(--size-3);
  justify-content: flex-end;
  right: var(--size-3);
  align-items: center;
  position: absolute;
  bottom: var(--size-6);
  right: var(--size-6);
  z-index: 1;
}

.settings-button {
  --pixel-scale: 2;
  width: calc(32px * var(--pixel-scale));
  aspect-ratio: 1;
  background: url('/assets/ui/settings-icon.png');
  background-size: cover;
  &:hover {
    filter: brightness(1.2);
  }
}

.game-board-menu {
  display: grid;
  gap: var(--size-2);
  > * {
    width: 100%;
  }
}
</style>
