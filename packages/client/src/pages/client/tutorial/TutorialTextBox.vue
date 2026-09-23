<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useTutorial } from './useTutorial';

const {
  currentStepTextBox,
  currentStepError,
  next,
  canRetry,
  retry,
  isFinished,
  nextMission
} = useTutorial();
</script>

<template>
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
        v-if="currentStepError && canRetry"
        text="Retry"
        class="mt-4 ml-auto"
        variant="error"
        @click="retry"
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
</style>
