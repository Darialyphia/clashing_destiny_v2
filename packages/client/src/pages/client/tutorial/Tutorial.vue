<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import GameScene from '@/game/components/GameScene.vue';
import { provideTutorial } from './useTutorial';
import TutorialHighlight from './TutorialHighlight.vue';
import TutorialTextBox from './TutorialTextBox.vue';
import TutorialGesture from './TutorialGesture.vue';
import SingleBattlefield from '@/game/components/MinionZone/SingleBattlefield.vue';

const { options } = defineProps<{
  options: Parameters<typeof provideTutorial>[0];
}>();

const { client, currentStepError, start } = provideTutorial(options);
onMounted(start);
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

    <template #battlefield>
      <SingleBattlefield />
    </template>
  </GameScene>
  <TutorialHighlight />

  <Transition>
    <div v-if="currentStepError" class="tutorial-error">
      {{ currentStepError }}
    </div>
  </Transition>

  <TutorialTextBox />
  <TutorialGesture />
</template>

<style scoped lang="postcss">
.tutorial-error {
  z-index: 10;
  position: fixed;
  left: 50%;
  top: var(--size-10);
  max-width: var(--size-md);
  translate: -50% 0;
  font-size: var(--font-size-4);
  color: var(--red-6);
  font-weight: var(--font-weight-9);
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;

  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 0.2s;
  }
  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
  }
}
</style>
