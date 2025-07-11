<script setup lang="ts">
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { useGameClient, useGameState } from '../composables/useGameClient';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { COMBAT_STEPS } from '@game/engine/src/game/phases/combat.phase';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

const client = useGameClient();
const state = useGameState();
const playerId = computed(() => client.value.playerId);
const message = computed(() => {
  const activePlayerId = client.value.getActivePlayerId();

  if (activePlayerId !== playerId.value) {
    if (state.value.effectChain) {
      return "Effect chain: Opponent's turn";
    }
    return 'Waiting for opponent...';
  }

  if (
    state.value.interaction.state === INTERACTION_STATES.SELECTING_MINION_SLOT
  ) {
    return 'Select a minion slot';
  }

  if (
    state.value.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
    state.value.interaction.ctx.player === playerId.value
  ) {
    const card = state.value.entities[
      state.value.interaction.ctx.card
    ] as CardViewModel;
    return `Put cards in the Destiny Zone (${client.value.ui.selectedManaCostIndices.length} / ${card?.manaCost})`;
  }
  if (
    state.value.interaction.state ===
    INTERACTION_STATES.SELECTING_CARDS_ON_BOARD
  ) {
    return 'Select targets';
  }

  if (state.value.effectChain) {
    return 'Effect chain: Your turn';
  }

  if (state.value.phase.state === GAME_PHASES.ATTACK) {
    if (state.value.phase.ctx.step === COMBAT_STEPS.DECLARE_TARGET) {
      return 'Declare attack target';
    }
    if (state.value.phase.ctx.step === COMBAT_STEPS.DECLARE_BLOCKER) {
      return 'Declare blocker or skip';
    }
  }
  return '';
});
</script>

<template>
  <p class="explainer-message">{{ message }}</p>
</template>

<style scoped lang="postcss">
.explainer-message {
  margin-inline-start: var(--size-9);
  transform: rotateX(-30deg);
  font-size: var(--font-size-5);
}
</style>
