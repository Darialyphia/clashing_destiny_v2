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
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui';

const ui = useGameUi();
const myPlayer = useMyPlayer();
const state = useGameState();
const { client } = useGameClient();

const isResourceActionMenuOpened = ref(false);

const canSelectHero = computed(() => {
  if (!ui.value.isInteractivePlayer) return false;
  if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
  if (!myPlayer.value.canTakeResourceAction) return false;
  return true;
});
</script>

<template>
  <div class="wrapper" :class="{ 'can-act': canSelectHero }">
    <DropdownMenuRoot
      v-model:open="isResourceActionMenuOpened"
      :side="'top'"
      :align="'center'"
    >
      <DropdownMenuTrigger
        v-if="canSelectHero"
        class="resource-action-indicator"
      />
      <DropdownMenuPortal>
        <DropdownMenuContent>
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
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
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
  &.can-act {
    cursor: pointer;

    & :deep(.unit) {
      --shadow-color: var(--yellow-5);
      filter: drop-shadow(0 0 10px var(--shadow-color));
      animation: pulse-hero 2s infinite ease-in-out;
    }
  }
}

@keyframes pulse-hero {
  0%,
  100% {
    filter: drop-shadow(0 0 5px var(--lime-5));
  }
  50% {
    filter: drop-shadow(0 0 15px var(--lime-3));
  }
}

.resource-action-indicator {
  position: absolute;
  top: -30px;
  left: 50%;
  translate: -50% 0;
  width: 40px;
  height: 40px;
  background: url('@/assets/ui/action-rune-colorless.png') no-repeat center
    center;
  background-size: contain;
  z-index: 1;
  animation: resource-action-indicator-float 2s infinite ease-in-out;
  filter: drop-shadow(0 0 10px var(--yellow-4));
  cursor: pointer;
  transition: filter 0.2s ease-in-out;
  &:hover {
    filter: drop-shadow(0 0 15px var(--yellow-3)) brightness(1.2);
  }
}

@keyframes resource-action-indicator-float {
  0%,
  100% {
    translate: -50% 0;
  }
  50% {
    translate: -50% -10px;
  }
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
