<script setup lang="ts">
import {
  useGameClient,
  useGameUi,
  useMyBoard,
  useMyPlayer
} from '../composables/useGameClient';
import HeroSlot from './HeroSlot.vue';
import DiscardPile from './DiscardPile.vue';
import BanishPile from './BanishPile.vue';
import Deck from './Deck.vue';
import DestinyDeck from './DestinyDeck.vue';
import GameCard from './GameCard.vue';
import DestinyZone from './DestinyZone.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';

const myPlayer = useMyPlayer();
const myBoard = useMyBoard();
const { playerId: activePlayerId } = useGameClient();

const ui = useGameUi();

const isDraggedCardPlayedInMinionZones = computed(() => {
  if (!ui.value.draggedCard) return false;
  const card = ui.value.draggedCard;
  return card.kind === CARD_KINDS.MINION || card.kind === CARD_KINDS.SIGIL;
});

const onMouseup = () => {
  if (!ui.value.draggedCard) return;

  ui.value.playDraggedCard();
};
</script>

<template>
  <div
    class="my-board"
    :class="{
      'is-dragging': ui.draggedCard,
      'is-active': myPlayer.id === activePlayerId
    }"
    @mouseup="onMouseup"
  >
    <div class="left-zone">
      <HeroSlot :player="myPlayer" class="hero" />
      <div
        class="artifacts"
        :class="{ 'is-condensed': myBoard.heroZone.artifacts.length > 2 }"
      >
        <InspectableCard
          v-for="artifact in myBoard.heroZone.artifacts"
          :key="artifact"
          :card-id="artifact"
          :open-delay="0"
          side="right"
        >
          <GameCard :card-id="artifact" variant="small" show-stats />
        </InspectableCard>
      </div>
    </div>

    <div class="center-zone">
      <div
        class="minion-zone"
        :class="{ 'is-dragging': isDraggedCardPlayedInMinionZones }"
        :id="ui.DOMSelectors.minionZone(myPlayer.id).id"
      >
        <InspectableCard
          v-for="card in myBoard.minions"
          :key="card"
          :card-id="card"
        >
          <GameCard :card-id="card" variant="small" show-stats show-modifiers />
        </InspectableCard>
        <InspectableCard
          v-for="card in myBoard.sigils"
          :key="card"
          :card-id="card"
        >
          <GameCard :card-id="card" variant="small" show-stats show-modifiers />
        </InspectableCard>
      </div>

      <DestinyZone
        class="destiny-zone"
        :player-id="myPlayer.id"
        :teaching-mode="false"
      />
    </div>

    <div class="piles-zone">
      <DiscardPile :player="myPlayer.id" />
      <BanishPile :player="myPlayer.id" />
      <Deck :size="myPlayer.remainingCardsInMainDeck" />
      <DestinyDeck :player-id="myPlayer.id" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.my-board {
  display: grid;
  grid-template-columns: auto 1fr auto;
  transform-style: preserve-3d;
  gap: var(--size-2);

  &.is-active {
    outline: 2px solid #ffb270;
    outline-offset: var(--size-1);
  }
  &.is-dragging {
    background-color: hsla(260, 50%, 20%, 0.2);
    box-shadow: 0 0 30px #985e25;
    &:hover {
      background-color: hsla(from cyan h s l / 0.15);
    }
  }
}

.left-zone {
  transform-style: preserve-3d;
  display: grid;
  grid-template-rows: auto 1fr;
  padding-inline-end: var(--size-5);
}

.hero {
  --pixel-scale: 1.5;
  /* fixes some mouse hit detection issues*/
  transform: translateZ(1px);
}

.center-zone {
  --pixel-scale: 1;
  display: grid;
  grid-template-rows: 1fr 1fr;
  row-gap: var(--size-1);
  /* fixes some mouse hit detection issues*/
  transform: translateZ(1px);
}

.minion-zone {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.destiny-zone {
  display: flex;
  justify-content: center;
  align-items: center;
}

.piles-zone {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: var(--size-7);
  column-gap: var(--size-4);
  place-content: center;
  transform-style: preserve-3d;
  transform: translateZ(1px);
}

.artifacts {
  --pixel-scale: 0.75;
  display: flex;
  gap: var(--size-1);
  align-self: stretch;
  align-items: center;
  transform: translateZ(1px);
  position: relative;

  &.is-condensed {
    --pixel-scale: 0.5;
  }
}
</style>
