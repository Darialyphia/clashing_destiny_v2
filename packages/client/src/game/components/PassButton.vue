<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';

defineOptions({
  inheritAttrs: false
});
const ui = useGameUi();

const passAction = computed(() => {
  return ui.value.globalActions.find(action => action.id === 'pass');
});

const attrs = useAttrs();
</script>

<template>
  <template v-if="ui.displayedElements.passButton">
    <button
      v-if="passAction"
      v-bind="attrs"
      :disabled="passAction.isDisabled"
      class="pass-button"
      aria-label="Pass"
      :id="ui.DOMSelectors.passButton.id"
      @click="passAction.onClick()"
    />
    <div v-else v-bind="attrs" class="enemy-turn-indicator" />
  </template>
</template>

<style scoped lang="postcss">
.pass-button {
  width: 152px;
  height: 55px;
  background: url(@/assets/ui/pass-button.png);
  color: transparent;
  transition: filter 0.3s ease;
  &:hover {
    filter: brightness(1.2) drop-shadow(0 0 12px lime);
  }
  &:disabled {
    filter: grayscale(100%) brightness(0.8);
  }
}

.enemy-turn-indicator {
  width: 203px;
  height: 55px;
  background: url(@/assets/ui/enemy-turn.png);
  color: transparent;
  transition: filter 0.3s ease;
}
</style>
