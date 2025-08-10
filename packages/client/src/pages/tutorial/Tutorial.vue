<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useTutorial } from './useTutorial';
import GameBoard from '@/game/components/GameBoard.vue';
import { useElementBounding } from '@vueuse/core';

const { options } = defineProps<{
  options: Parameters<typeof useTutorial>[0];
}>();

const {
  client,
  currentStepTextBox,
  currentStepError,
  next,
  isFinished,
  nextMission
} = useTutorial(options);

const rect = useElementBounding(
  computed(() => client.value.ui.highlightedElement)
);
const RECT_PADDING = 15;
</script>

<template>
  <GameBoard v-if="client.isReady" />
  <div
    class="highlight"
    v-if="client.ui.highlightedElement"
    :style="{
      '--left': `${rect.left.value - RECT_PADDING}`,
      '--top': `${rect.top.value - RECT_PADDING}`,
      '--width': `${rect.width.value + RECT_PADDING * 2}`,
      '--height': `${rect.height.value + RECT_PADDING * 2}`
    }"
  />
  <div v-if="currentStepError" class="error">{{ currentStepError }}</div>
  <div
    class="surface text-box"
    v-if="currentStepTextBox"
    :key="currentStepTextBox?.text"
  >
    {{ currentStepTextBox?.text }}
    <FancyButton
      v-if="currentStepTextBox?.canGoNext"
      text="Next"
      class="mt-4 ml-auto"
      @click="next"
    />
    <FancyButton
      v-if="isFinished"
      class="mt-4 ml-auto"
      :to="
        nextMission
          ? { name: 'TutorialMission', params: { id: nextMission } }
          : { name: 'TutorialList' }
      "
      :text="nextMission ? 'New Mission' : 'Back to Missions'"
    />
  </div>
</template>

<style scoped lang="postcss">
.text-box {
  position: fixed;
  right: 0;
  bottom: 55%;
  max-width: var(--size-xs);
  font-size: var(--font-size-3);
  transition: all 0.4s var(--ease-2);
  @starting-style {
    opacity: 0;
    transform: scale(0.5);
  }
}

.error {
  z-index: 10;
  background-color: var(--red-8);
  position: fixed;
  left: 50%;
  top: var(--size-6);
  max-width: var(--size-sm);
  translate: -50% 0;
  font-size: var(--font-size-4);
}

.highlight {
  position: fixed;
  inset: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
  box-shadow: 0 0 0 100vmax hsl(0 0 0 / 0.5);
  translate: calc(1px * var(--left)) calc(1px * var(--top));
  scale: calc(var(--width)) calc(var(--height));
  transform-origin: top left;
  transform:
    translate 0.5s var(--ease-3),
    scale 0.5s var(--ease-3);
}
</style>
