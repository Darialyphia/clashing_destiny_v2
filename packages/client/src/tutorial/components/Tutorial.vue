<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import GameScene from '@/game/components/GameScene.vue';
import { provideTutorial } from '../../pages/client/tutorial/useTutorial';
import TutorialHighlight from './TutorialHighlight.vue';
import TutorialTextBox from './TutorialTextBox.vue';
import TutorialGesture from './TutorialGesture.vue';
import TutorialRetryButton from './TutorialRetryButton.vue';
import SingleBattlefield from '@/game/components/MinionZone/SingleBattlefield.vue';
import DoubleBattlefield from '@/game/components/MinionZone/DoubleBattlefield.vue';
import { provideUserSettings } from '@/shared/composables/useUserSettings';

const { options, nextMission } = defineProps<{
  options: Parameters<typeof provideTutorial>[0];
  nextMission?: string;
}>();

const { client, currentStepError, start, retry, gameKey } =
  provideTutorial(options);
provideUserSettings();
onMounted(start);

const isRetrying = ref(false);
const onRetry = async () => {
  isRetrying.value = true;
  try {
    await retry();
  } finally {
    isRetrying.value = false;
  }
};
</script>

<template>
  <!-- keyed so the game over screen goes away after a retry -->
  <GameScene
    v-if="client.isReady"
    :key="gameKey"
    :options="{ teachingMode: false }"
  >
    <template #menu>
      <FancyButton
        text="Quit"
        class="w-full"
        variant="error"
        :to="{ name: 'ClientHome' }"
      />
    </template>

    <template #battlefield>
      <DoubleBattlefield v-if="options.boardType === 'double'" />
      <SingleBattlefield v-else :has-supply="options.boardType === 'single'" />
    </template>

    <template #game-over="{ hasWon }">
      <p class="game-over-title">
        {{ hasWon ? 'Mission complete!' : 'Mission failed.' }}
      </p>
      <div class="game-over-actions">
        <FancyButton
          v-if="hasWon && nextMission"
          text="Next Mission"
          :to="{ name: 'TutorialMission', params: { id: nextMission } }"
        />
        <FancyButton
          v-if="!hasWon"
          text="Retry"
          variant="error"
          :is-loading="isRetrying"
          @click="onRetry"
        />
        <FancyButton text="Main Menu" :to="{ name: 'ClientHome' }" />
      </div>
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
  <TutorialRetryButton />
</template>

<style scoped lang="postcss">
/* GameScene's scoped styles don't reach slot content */
.game-over-title {
  color: white;
}

.game-over-actions {
  display: flex;
  gap: var(--size-4);
  margin-block-start: var(--size-6);
}

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
