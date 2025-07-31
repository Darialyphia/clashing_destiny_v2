<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useTutorial } from '../composables/useTutorial';
import GameBoard from './GameBoard.vue';

const { options } = defineProps<{
  options: Parameters<typeof useTutorial>[0];
}>();

const { client, currentStepTextBox, next } = useTutorial(options);
</script>

<template>
  <GameBoard v-if="client.isReady" />
  <div>
    {{ currentStepTextBox?.text }}
    <FancyButton
      v-if="currentStepTextBox?.canGoNext"
      text="Next"
      class="mt-4"
      @click="next"
    />
  </div>
</template>

<style scoped lang="postcss"></style>
