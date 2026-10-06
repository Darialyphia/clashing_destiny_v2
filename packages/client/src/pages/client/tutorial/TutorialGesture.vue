<script setup lang="ts">
import { useTutorial } from './useTutorial';

const { currentStepTextBox, tutorial } = useTutorial();

const coordinates = computed(() => {
  if (!currentStepTextBox.value?.gesture) return { x: 0, y: 0 };

  const from = currentStepTextBox.value.gesture.from(tutorial.value.ctx);
  const to = currentStepTextBox.value.gesture.to(tutorial.value.ctx);

  if (!from || !to) return { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };

  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  return {
    from: {
      x: fromRect.x + fromRect.width / 2,
      y: fromRect.y + fromRect.height / 2
    },
    to: {
      x: toRect.x + toRect.width / 2,
      y: toRect.y + toRect.height / 2
    }
  };
});
</script>

<template>
  <div
    class="tutorial-gesture"
    v-if="currentStepTextBox?.gesture"
    :style="{
      '--from-x': coordinates.from?.x + 'px',
      '--from-y': coordinates.from?.y + 'px',
      '--to-x': coordinates.to?.x + 'px',
      '--to-y': coordinates.to?.y + 'px'
    }"
  />
</template>

<style scoped>
@keyframes tutorial-gesture-move {
  from,
  30% {
    transform: translate(var(--from-x), var(--from-y));
  }
  to {
    transform: translate(var(--to-x), var(--to-y));
  }
}
.tutorial-gesture {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;

  width: 48px;
  height: 48px;
  background: url('@/assets/ui/tutorial-pointer.png');
  background-size: cover;
  filter: drop-shadow(0 0 4px #ffff33cc);
  animation: tutorial-gesture-move 2s infinite;
}
</style>
