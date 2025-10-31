<script setup lang="ts">
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import {
  useGameState,
  useGameUi,
  useMaybeEntity,
  useMyPlayer
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

const state = useGameState();
const ui = useGameUi();
const player = useMyPlayer();
const cardId = computed(() => {
  if (state.value.interaction.state !== INTERACTION_STATES.PLAYING_CARD) {
    return null;
  }
  if (player.value.id !== state.value.interaction.ctx.player) {
    return null;
  }

  return state.value.interaction.ctx.card;
});

const card = useMaybeEntity<CardViewModel>(cardId);
</script>

<template>
  <Transition>
    <div class="played-card-intent" v-if="cardId">
      <InspectableCard :card-id="cardId" side="left">
        <GameCard
          :interactive="false"
          :card-id="cardId"
          variant="small"
          style="--pixel-scale: 1"
        />

        <div class="cost">
          {{ ui.selectedManaCostIndices.length }} / {{ card?.manaCost }}
        </div>
      </InspectableCard>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.played-card-intent {
  position: relative;
  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
  &.v-enter-active,
  &.v-leave-active {
    transition:
      opacity 0.2s var(--ease-3),
      transform 0.2s var(--ease-3);
  }
}

.cost {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: var(--font-size-1);
  color: white;
}
</style>
