<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useTutorial } from './useTutorial';
import { useGameState, useMyPlayer } from '@/game/composables/useGameClient';
import { useFloating, shift, autoUpdate } from '@floating-ui/vue';

const { currentStepTextBox, next } = useTutorial();

const textBox = ref<HTMLElement | null>(null);

const { width: viewportWidth, height: viewportHeight } = useWindowSize();

const textBoxReferenceCoordinates = computed(() => {
  if (!currentStepTextBox.value) return { x: 0, y: 0 };

  const { left, right, top, bottom } = currentStepTextBox.value;
  const leftPos = left
    ? left.endsWith('%')
      ? (parseFloat(left) / 100) * viewportWidth.value
      : parseFloat(left)
    : null;
  const rightPos = right
    ? right.endsWith('%')
      ? viewportWidth.value - (parseFloat(right) / 100) * viewportWidth.value
      : viewportWidth.value - parseFloat(right)
    : null;

  const topPos = top
    ? top.endsWith('%')
      ? (parseFloat(top) / 100) * viewportHeight.value
      : parseFloat(top)
    : null;
  const bottomPos = bottom
    ? bottom.endsWith('%')
      ? viewportHeight.value - (parseFloat(bottom) / 100) * viewportHeight.value
      : viewportHeight.value - parseFloat(bottom)
    : null;
  const x = leftPos ?? rightPos ?? 0;
  const y = topPos ?? bottomPos ?? 0;
  return { x, y };
});

const virtualReference = computed(() => ({
  getBoundingClientRect() {
    return {
      width: 0,
      height: 0,
      x: textBoxReferenceCoordinates.value.x,
      y: textBoxReferenceCoordinates.value.y,
      top: textBoxReferenceCoordinates.value.y,
      left: textBoxReferenceCoordinates.value.x,
      right: textBoxReferenceCoordinates.value.x,
      bottom: textBoxReferenceCoordinates.value.y
    };
  }
}));

const { floatingStyles } = useFloating(virtualReference, textBox, {
  strategy: 'fixed',
  placement: 'top',
  whileElementsMounted: autoUpdate,
  middleware: [
    shift({
      padding: 16
    })
  ]
});

const state = useGameState();

const myPlayer = useMyPlayer();

const shouldHide = computed(() => {
  if (!currentStepTextBox.value) return true;
  if (
    currentStepTextBox.value.hideDuringOpponentInitiative &&
    state.value.turn.initiativePlayer !== myPlayer.value.id
  ) {
    return true;
  }
  return false;
});
</script>

<template>
  <div class="text-box-container">
    <div
      v-if="currentStepTextBox && !shouldHide"
      ref="textBox"
      class="surface text-box"
      :key="currentStepTextBox?.text"
      :style="floatingStyles"
    >
      <div v-html="currentStepTextBox?.text" />
      <FancyButton
        v-if="currentStepTextBox?.canManuallyAdvance"
        text="Next"
        class="mt-4 ml-auto"
        @click="next"
      />
      <!-- <FancyButton
        v-if="tutorial"
        class="mt-4 ml-auto"
        :to="
          nextMission
            ? { name: 'TutorialMission', params: { id: nextMission } }
            : { name: 'TutorialHome' }
        "
        :text="nextMission ? 'New Mission' : 'Back to Missions'"
      /> -->
    </div>
  </div>
</template>

<style scoped lang="postcss">
.text-box-container {
  top: 0;
  left: 0;
  width: 100vw;
  position: fixed;
  height: 100dvh;
  aspect-ratio: 16 / 9;
  pointer-events: none;
}

.text-box {
  pointer-events: auto;
  position: absolute;
  box-sizing: border-box;
  max-width: min(var(--size-xs), calc(100vw - 2 * var(--size-4)));
  max-height: calc(100dvh - 2 * var(--size-4));
  overflow-y: auto;
  font-size: var(--font-size-3);
  color: white;
  padding-inline: var(--size-8);
  transition: filter 0.4s var(--ease-2);
  @starting-style {
    filter: brightness(1.25);
  }

  :global(b) {
    color: var(--primary);
  }
}
</style>
