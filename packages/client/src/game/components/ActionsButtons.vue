<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
const ui = useGameUi();
import BattleLog from './BattleLog.vue';
import { useBattleLog } from '../composables/useBattleLog';
import UiDrawer from '@/ui/components/UiDrawer.vue';
import UiButton from '@/ui/components/UiButton.vue';
import { Icon } from '@iconify/vue';

const battleLog = useBattleLog();
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

const isBattleLogOpened = ref(false);
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
        <div class="surface h-full flex flex-col gap-4">
          <h3>Battle Log</h3>
          <BattleLog :events="battleLog" />
        </div>
      </UiDrawer>
    </div>
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
