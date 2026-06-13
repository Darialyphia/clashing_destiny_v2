<script setup lang="ts">
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import {
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import BoardCard from './BoardCard.vue';
import { RUNES } from '@game/engine/src/player/player.enums';

const ui = useGameUi();
const myPlayer = useMyPlayer();
const state = useGameState();
const { client } = useGameClient();

let startX = 0;
let startY = 0;
const DRAG_THRESHOLD_PX = 30;

const isResourceActionMenuOpened = ref(false);

const canSelectHero = computed(() => {
  if (!ui.value.isInteractivePlayer) return false;
  if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
  if (!myPlayer.value.canTakeResourceAction) return false;
  return true;
});

const onMousemove = (e: MouseEvent) => {
  const deltaY = Math.abs(startY - e.clientY);
  const deltaX = Math.abs(startX - e.clientX);
  if (deltaY >= DRAG_THRESHOLD_PX || deltaX >= DRAG_THRESHOLD_PX) {
    isResourceActionMenuOpened.value = true;
    document.body.removeEventListener('mousemove', onMousemove);
  }
};

const onMousedown = (e: MouseEvent) => {
  if (!canSelectHero.value) return;
  startX = e.clientX;
  startY = e.clientY;

  document.body.addEventListener('mousemove', onMousemove);
  document.body.addEventListener('mouseup', onMouseup, { once: true });
};

const onMouseup = () => {
  document.body.removeEventListener('mousemove', onMousemove);
  nextTick(() => {
    isResourceActionMenuOpened.value = false;
  });
};
</script>

<template>
  <div class="wrapper" @mousedown="onMousedown">
    <Transition>
      <div class="resource-actions-menu" v-if="isResourceActionMenuOpened">
        <button
          class="resource-action might"
          @mouseup="
            client.takeResourceAction({
              type: 'rune',
              rune: RUNES.MIGHT
            })
          "
        />
        <button
          class="resource-action wisdom"
          @mouseup="
            client.takeResourceAction({
              type: 'rune',
              rune: RUNES.WISDOM
            })
          "
        />
        <button
          class="resource-action focus"
          @mouseup="
            client.takeResourceAction({
              type: 'rune',
              rune: RUNES.FOCUS
            })
          "
        />
        <button
          class="resource-action resonance"
          @mouseup="
            client.takeResourceAction({
              type: 'rune',
              rune: RUNES.RESONANCE
            })
          "
        />
        <button
          class="resource-action draw"
          @mouseup="
            client.takeResourceAction({
              type: 'draw'
            })
          "
        />
      </div>
    </Transition>
    <BoardCard
      v-if="myPlayer.hero"
      :card="myPlayer.hero"
      @mouseenter="ui.hover(myPlayer.hero)"
      @mouseleave="ui.unhover()"
    />
  </div>
</template>

<style scoped lang="postcss">
.wrapper {
  position: relative;
}

.resource-actions-menu {
  position: absolute;
  bottom: calc(100% + var(--size-7));
  left: 50%;
  translate: -50% 0;
  display: flex;
  gap: var(--size-4);
  padding: var(--size-4);
  background-color: var(--color-bg-2);
  border-radius: var(--size-1);
  box-shadow: var(--shadow-2);
  background-color: hsl(0 0% 0% / 0.5);
  backdrop-filter: blur(4px);

  &.v-enter-active,
  &.v-leave-active {
    transition: all 0.2s var(--ease-2);
  }

  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
    translate: -50% 1rem;
  }
}
.resource-action {
  width: 38px;
  height: 42px;
  background: transparent;
}

.might {
  background: url('@/assets/ui/action-rune-might.png') no-repeat center center;
}
.wisdom {
  background: url('@/assets/ui/action-rune-wisdom.png') no-repeat center center;
}
.focus {
  background: url('@/assets/ui/action-rune-focus.png') no-repeat center center;
}
.resonance {
  background: url('@/assets/ui/action-rune-resonance.png') no-repeat center
    center;
}
.draw {
  background: url('@/assets/ui/action-draw.png') no-repeat center center;
}
</style>
