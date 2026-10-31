<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useTutorial } from '../../pages/client/tutorial/useTutorial';

const { isCurrentStepFailed, isGameOver, retry } = useTutorial();

const isRetrying = ref(false);
const onClick = async () => {
  isRetrying.value = true;
  try {
    await retry();
  } finally {
    isRetrying.value = false;
  }
};
</script>

<template>
  <Transition>
    <!-- when the game is over, the game over screen offers to retry instead -->
    <div v-if="isCurrentStepFailed && !isGameOver" class="tutorial-retry">
      <p>Mission failed. Please try again.</p>
      <FancyButton
        text="Retry"
        variant="error"
        size="lg"
        :is-loading="isRetrying"
        @click="onClick"
      />
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.tutorial-retry {
  /* above the text boxes */
  z-index: 10;
  position: fixed;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: var(--size-4);
  background-color: rgba(0, 0, 0, 0.5);

  &.v-enter-active,
  &.v-leave-active {
    transition:
      opacity 0.2s,
      scale 0.2s var(--ease-out-3);
  }
  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
    scale: 0.8;
  }
}

p {
  text-align: center;
  font-size: var(--font-size-6);
  font-weight: var(--font-weight-5);
}
</style>
