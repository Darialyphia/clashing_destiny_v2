<script setup lang="ts">
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { useGameClient, useGameState } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';
import { COMBAT_STEPS } from '@game/engine/src/game/phases/combat.phase';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';

const client = useGameClient();
const state = useGameState();

const canEndTurn = computed(() => {
  return (
    state.value.phase.state === GAME_PHASES.MAIN &&
    state.value.interaction.state === INTERACTION_STATES.IDLE &&
    client.value.playerId === state.value.turnPlayer
  );
});
</script>

<template>
  <div class="action-buttons">
    <FancyButton
      v-if="
        state.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
        state.interaction.ctx.player === client.playerId
      "
      text="Play Card"
      variant="info"
      @click="
        console.log('Commit play card', client.ui.selectedManaCostIndices);
        client.networkAdapter.dispatch({
          type: 'commitPlayCard',
          payload: {
            playerId: client.playerId,
            manaCostIndices: client.ui.selectedManaCostIndices
          }
        });
      "
    />

    <FancyButton
      v-if="
        state.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
        state.interaction.ctx.player === client.playerId
      "
      text="Cancel"
      @click="client.cancelPlayCard"
    />

    <FancyButton
      v-if="
        state.interaction.state === INTERACTION_STATES.SELECTING_MINION_SLOT &&
        state.interaction.ctx.player === client.playerId &&
        state.interaction.ctx.canCommit
      "
      text="Confirm"
      variant="info"
      @click="
        client.networkAdapter.dispatch({
          type: 'commitMinionSlotSelection',
          payload: {
            playerId: client.playerId
          }
        })
      "
    />

    <FancyButton
      v-if="
        state.interaction.state ===
          INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
        state.interaction.ctx.player === client.playerId &&
        state.interaction.ctx.canCommit
      "
      text="Confirm"
      variant="info"
      @click="
        client.networkAdapter.dispatch({
          type: 'commitCardSelection',
          payload: {
            playerId: client.playerId
          }
        })
      "
    />
    <FancyButton
      v-if="
        state.phase.state === GAME_PHASES.ATTACK &&
        state.phase.ctx.step === COMBAT_STEPS.DECLARE_BLOCKER &&
        state.turnPlayer !== client.playerId
      "
      text="Skip Block"
      variant="error"
      @click="
        client.networkAdapter.dispatch({
          type: 'declareBlocker',
          payload: {
            blockerId: null,
            playerId: client.playerId
          }
        })
      "
    />
    <FancyButton
      v-if="state.effectChain"
      text="Pass chain"
      @click="
        client.networkAdapter.dispatch({
          type: 'passChain',
          payload: {
            playerId: client.playerId
          }
        })
      "
    />
    <FancyButton
      text="End turn"
      variant="error"
      :disabled="!canEndTurn"
      @click="
        client.networkAdapter.dispatch({
          type: 'declareEndTurn',
          payload: {
            playerId: client.playerId
          }
        })
      "
    />
  </div>
</template>

<style scoped lang="postcss">
.action-buttons {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  bottom: var(--size-3);
  right: var(--size-3);
  z-index: 2;
  align-items: center;
  & > * {
    width: 100%;
  }
}
</style>
