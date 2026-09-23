<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import GameScene from '@/game/components/GameScene.vue';
import { provideTutorial } from './useTutorial';
import TutorialHighlight from './TutorialHighlight.vue';
import TutorialTextBox from './TutorialTextBox.vue';

const { options } = defineProps<{
  options: Parameters<typeof provideTutorial>[0];
}>();

const { client, currentStepError } = provideTutorial(options);
</script>

<template>
  <GameScene v-if="client.isReady" :options="{ teachingMode: false }">
    <template #menu>
      <FancyButton
        text="Quit"
        class="w-full"
        variant="error"
        :to="{ name: 'ClientHome' }"
      />
    </template>
  </GameScene>
  <TutorialHighlight />

  <div v-if="currentStepError" class="tutorial-error">
    {{ currentStepError }}
  </div>

  <TutorialTextBox />
</template>

<style scoped lang="postcss">
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
</style>
