<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { player } = defineProps<{ player: PlayerViewModel }>();

const state = useGameState();
const { client } = useGameClient();
const myPlayer = useMyPlayer();
const ui = useGameUi();

const canSupply = computed(() => {
  if (!myPlayer.value.equals(player)) return false;
  if (state.value.phase.state !== GAME_PHASES.PLAY_CARD) return false;
  const interaction = state.value.interaction;
  if (
    interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
    interaction.ctx.selectedCards.length
  ) {
    return false;
  }
  if (
    interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD &&
    interaction.ctx.selectedSpaces.length
  ) {
    return false;
  }
  return true;
});

const onMouseup = (event: MouseEvent) => {
  if (!canSupply.value) return;
  event.stopPropagation();
  client.value.supplyCard();
};

const isHovered = ref(false);
const onMouseenter = () => {
  if (!canSupply.value) return;
  isHovered.value = true;
};

const onMouseleave = () => {
  if (!canSupply.value) return;
  isHovered.value = false;
};
</script>

<template>
  <div
    class="supply-zone"
    :class="{ hoverable: canSupply }"
    @mouseup="onMouseup"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <div class="player-mana">
      <rt-mana>{{ player.mana }}</rt-mana>
    </div>
    <div v-for="card in player.supplyZone" :key="card.id" class="supply-card">
      <InspectableCard :card-id="card.id" side="top" align="center">
        <GameCard :card-id="card.id" variant="small" />
      </InspectableCard>
    </div>

    <transition>
      <div
        class="supply-indicator"
        v-if="canSupply && ui.selectedCard && isHovered"
      >
        <div>
          +
          <rt-mana>{{ ui.selectedCard.manaSupply }}</rt-mana>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.supply-zone {
  width: 350px;
  position: relative;
  height: var(--card-small-v3-height);
  transition: box-shadow 0.3s var(--ease-2);
  display: flex;
  align-items: center;
  &.hoverable:hover {
    box-shadow: 0 0 35px var(--yellow-5);
  }
}

.supply-card {
  position: absolute;
  top: 0;
  left: calc(10px + (var(--child-index) - 1) * 50px);
}

.player-mana {
  scale: 2;
  translate: -15px 0;
}

.supply-indicator {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-weight: bold;
  color: var(--white);
  -webkit-text-stroke: 2px var(--black);
  paint-order: stroke fill;
  scale: 2;
  transform: translateY(-30px);

  &.v-enter-active,
  &.v-leave-active {
    transition:
      opacity 0.3s var(--ease-2),
      transform 0.3s var(--ease-2);
  }
  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
    transform: translateY(0);
  }
}
</style>
