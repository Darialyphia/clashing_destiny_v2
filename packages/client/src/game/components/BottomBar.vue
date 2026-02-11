<script setup lang="ts">
import { useGameState, useMyPlayer } from '../composables/useGameClient';
import ActionsButtons from './ActionsButtons.vue';
import { useGameKeyboardControls } from '../composables/useGameKeyboardControls';
import EffectChain from './EffectChain.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const state = useGameState();
const myPlayer = useMyPlayer();

useGameKeyboardControls();
</script>

<template>
  <div class="bottom-bar">
    <EffectChain />
    <Transition>
      <div
        class="card-being-played"
        v-if="
          state.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
          state.interaction.ctx.player === myPlayer.id
        "
      >
        <InspectableCard :card-id="state.interaction.ctx.card" side="left">
          <GameCard :card-id="state.interaction.ctx.card" variant="small" />
        </InspectableCard>
      </div>
    </Transition>
    <ActionsButtons />
  </div>
</template>

<style scoped lang="postcss">
.card-being-played {
  --pixel-scale: 0.75;
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.3s var(--ease-2);
  }
  &.v-enter-from {
    filter: brightness(3);
    scale: 1.25;
    opacity: 0.5;
  }
  &.v-leave-to {
    scale: 0;
    transform-origin: center;
    opacity: 0;
  }
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--size-3);
  transform: translateZ(1px);
  height: 127px;
}
</style>
