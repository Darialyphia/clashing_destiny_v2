<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useTutorial } from '../../pages/client/tutorial/useTutorial';

const { isCurrentStepFailed, retry } = useTutorial();

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
    <div v-if="isCurrentStepFailed" class="tutorial-retry">
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
  left: 50%;
  top: 50%;
  translate: -50% -50%;

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
</style>
