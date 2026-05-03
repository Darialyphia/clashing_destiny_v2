<script setup lang="ts">
import { useGameUi } from '../composables/useGameClient';

const ui = useGameUi();

const passAction = computed(() => {
  return ui.value.globalActions.find(action => action.id === 'pass');
});
</script>

<template>
  <button
    v-if="passAction"
    :disabled="passAction.isDisabled"
    class="pass-button"
    aria-label="Pass"
    @click="passAction.onClick()"
  />
</template>

<style scoped lang="postcss">
.pass-button {
  width: 152px;
  height: 55px;
  background: url(@/assets/ui/pass-button.png);
  color: transparent;
  position: absolute;
  left: 900px;
  top: 282px;
  transition: filter 0.3s ease;
  &:hover {
    filter: brightness(1.2) drop-shadow(0 0 12px lime);
  }
  &:disabled {
    filter: grayscale(100%) brightness(0.8);
  }
}
</style>
