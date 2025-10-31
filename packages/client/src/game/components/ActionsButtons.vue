<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import PlayedCardIntent from './PlayedCardIntent.vue';
import ExplainerMessage from './ExplainerMessage.vue';

const ui = useGameUi();

const isSettingsOpened = ref(false);

useKeyboardControl(
  'keydown',
  {
    key: 'Escape',
    modifier: null
  },
  () => {
    isSettingsOpened.value = !isSettingsOpened.value;
  }
);

const offsetY = computed(() => {
  // if (state.value.interaction.state !== INTERACTION_STATES.PLAYING_CARD) {
  //   return 0;
  // }
  // if (state.value.interaction.ctx.player !== myPlayer.value.id) {
  //   return 0;
  // }
  if (!ui.value.isHandExpanded) return 0;

  return '-240px';
});
</script>

<template>
  <div
    class="action-buttons"
    :style="{ '--offset-y': offsetY }"
    :id="ui.DOMSelectors.globalActionButtons.id"
  >
    <PlayedCardIntent />
    <div
      class="actions"
      :class="{ 'ui-hidden': !ui.displayedElements.actionButtons }"
    >
      <FancyButton
        v-for="action in ui.globalActions"
        :key="action.id"
        :id="ui.DOMSelectors.actionButton(action.id).id"
        :text="action.label"
        :variant="action.variant"
        :disabled="action.isDisabled"
        @click="action.onClick"
      />
    </div>
    <ExplainerMessage v-if="!ui.isHandExpanded" />
  </div>
</template>

<style scoped lang="postcss">
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  justify-content: center;
  align-items: center;
  translate: 0 var(--offset-y);
  transition: translate 0.2s var(--ease-3);
}
.actions {
  display: flex;
  gap: var(--size-4);
  justify-content: center;
  align-items: flex-end;
}
</style>
