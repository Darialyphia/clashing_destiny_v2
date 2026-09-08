<script setup lang="ts">
const isOpened = ref(false);
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
}

.game-board-menu {
  display: grid;
  gap: var(--size-2);
  > * {
    width: 100%;
  }
}
</style>
