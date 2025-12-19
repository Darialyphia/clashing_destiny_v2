<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
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
</script>

<template>
  <div
    class="action-buttons"
    :class="{ elevated: ui.isHandExpanded }"
    :id="ui.DOMSelectors.globalActionButtons.id"
  >
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
    <!-- <footer>
      <UiButton
        class="battle-log-toggle"
        @click="isBattleLogOpened = !isBattleLogOpened"
      >
        <Icon icon="game-icons:black-book" class="w-7 aspect-square" />
      </UiButton>

      <UiDrawer
        v-model:is-opened="isBattleLogOpened"
        side="right"
        title="Battle Log"
      >
        <BattleLog :events="battleLog" />
      </UiDrawer>
      <ExplainerMessage v-if="!ui.isHandExpanded" />
    </footer> -->
  </div>
</template>

<style scoped lang="postcss">
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  justify-content: center;
  align-items: center;
  transition: translate 0.2s var(--ease-3);
}
.actions {
  display: flex;
  gap: var(--size-4);
  justify-content: center;
  align-items: flex-end;
  transform: translateZ(0px);
}
</style>
