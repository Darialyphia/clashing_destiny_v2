<script setup lang="ts">
import EffectChain from './EffectChain.vue';
import ActionsButtons from './ActionsButtons.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';
import GameCard from './GameCard.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import { useGameState, useMyPlayer } from '../composables/useGameClient';

const state = useGameState();
const myPlayer = useMyPlayer();
</script>

<template>
  <div class="bottom-row">
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
.bottom-row {
  display: flex;
  justify-content: space-between;
  gap: var(--size-3);
  transform: translateZ(1px);
}

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
</style>
