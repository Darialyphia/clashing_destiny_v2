<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import GameBoard from '@/game/components/GameBoard.vue';
import { useElementBounding } from '@vueuse/core';
import { useTutorial } from './useTutorial';

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
  <GameBoard v-if="client.isReady" :options="{ teachingMode: false }">
    <template #menu>
      <RouterLink
        custom
        v-slot="{ navigate, href }"
        :to="{ name: 'ClientHome' }"
      >
        <FancyButton
          text="Quit"
          class="w-full"
          :href="href"
          variant="error"
          @click="navigate"
        />
      </RouterLink>
    </template>
  </GameBoard>
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
  <div v-if="currentStepError" class="tutorial-error">
    {{ currentStepError }}
  </div>

  <div class="text-box-container">
    <div
      v-if="currentStepTextBox"
      class="surface text-box"
      :key="currentStepTextBox?.text"
      :style="{
        '--left': currentStepTextBox.left,
        '--right': currentStepTextBox.right,
        '--top': currentStepTextBox.top,
        '--bottom': currentStepTextBox.bottom,
        '--x-offset': currentStepTextBox.centered?.x ? '-50%' : '0',
        '--y-offset': currentStepTextBox.centered?.y ? '-50%' : '0'
      }"
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
            : { name: 'TutorialHome' }
        "
        :text="nextMission ? 'New Mission' : 'Back to Missions'"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.text-box-container {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  position: fixed;
  height: 100dvh;
  aspect-ratio: 16 / 9;
  pointer-events: none;
}

.text-box {
  pointer-events: auto;
  position: absolute;
  right: var(--right);
  left: var(--left);
  top: var(--top);
  bottom: var(--bottom);
  transform: translate(var(--x-offset), var(--y-offset));
  max-width: var(--size-xs);
  font-size: var(--font-size-3);
  color: white;
  padding-inline: var(--size-8);
  transition:
    scale 0.4s var(--ease-2),
    opacity 0.4s var(--ease-2);
  @starting-style {
    opacity: 0;
    scale: 0.5;
  }
}

.tutorial-error {
  z-index: 10;
  background-color: var(--red-8);
  position: fixed;
  left: 50%;
  top: var(--size-6);
  max-width: var(--size-sm);
  translate: -50% 0;
  font-size: var(--font-size-4);
}

@keyframes highlight-pulse {
  50% {
    backdrop-filter: brightness(1.5);
  }
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
  animation: highlight-pulse 2s infinite;
}
</style>
