<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';

const isOpened = ref(false);

const isGameSettingsOpened = ref(false);
const settings = useSettingsStore();

useKeyboardControl(
  'keydown',
  settings.settings.bindings.openSettings.control,
  () => {
    isGameSettingsOpened.value = !isGameSettingsOpened.value;
  }
);
</script>

<template>
  <button
    aria-label="Settings"
    class="settings-button"
    @click="isOpened = true"
  />

  <!-- <GamePhaseIndicator /> -->

  <UiModal
    v-model:is-opened="isOpened"
    title="Menu"
    description="Game settings"
    :style="{ '--ui-modal-size': 'var(--size-xs)' }"
  >
    <div class="game-board-menu">
      <FancyButton text="Close" @click="isOpened = false" />
      <slot name="menu" />
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.settings-button {
  --pixel-scale: 2;
  position: fixed;
  right: var(--size-8);
  bottom: var(--size-6);
  width: calc(32px * var(--pixel-scale));
  aspect-ratio: 1;
  background: url('@/assets/ui/settings-icon.png');
  background-size: cover;
  z-index: 2;
  &:hover {
    filter: brightness(1.2);
  }

  @screen lt-lg {
    right: var(--size-4);
    bottom: var(--size-4);
    --pixel-scale: 1;
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
