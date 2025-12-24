<script setup lang="ts">
import {
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
import {
  BOARD_SLOT_ZONES,
  type BoardSlotZone
} from '@game/engine/src/board/board.constants';

const myPlayer = useMyPlayer();
const myBoard = useMyBoard();

const ui = useGameUi();

const isDraggedCardPlayedInMinionZones = computed(() => {
  if (!ui.value.draggedCard) return false;
  const card = ui.value.draggedCard;
  return card.kind === CARD_KINDS.MINION || card.kind === CARD_KINDS.SIGIL;
});

const onMouseup = (e: MouseEvent, zone: BoardSlotZone) => {
  if (!ui.value.draggedCard) return;
  if (!isDraggedCardPlayedInMinionZones.value) return;
  ui.value.playDraggedCard(zone);
  e.stopPropagation();
};
</script>

<template>
  <div class="my-board">
    <div class="left-zone">
      <HeroSlot :player="myPlayer" class="hero" />
      <DestinyZone :player-id="myPlayer.id" :teaching-mode="false" />
    </div>

    <div class="center-zone">
      <div
        class="attack-zone"
        :class="{ 'is-dragging': isDraggedCardPlayedInMinionZones }"
        :id="ui.DOMSelectors.attackZone(myPlayer.id).id"
        @mouseup="onMouseup($event, BOARD_SLOT_ZONES.ATTACK_ZONE)"
      >
        <InspectableCard
          v-for="card in myBoard.attackZone"
          :key="card"
          :card-id="card"
        >
          <GameCard :card-id="card" variant="small" show-stats show-modifiers />
        </InspectableCard>
      </div>
      <div
        class="defense-zone"
        :class="{ 'is-dragging': isDraggedCardPlayedInMinionZones }"
        :id="ui.DOMSelectors.defenseZone(myPlayer.id).id"
        @mouseup="onMouseup($event, BOARD_SLOT_ZONES.DEFENSE_ZONE)"
      >
        <InspectableCard
          v-for="card in myBoard.defenseZone"
          :key="card"
          :card-id="card"
        >
          <GameCard :card-id="card" variant="small" show-stats show-modifiers />
        </InspectableCard>
      </div>
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
  padding-bottom: var(--size-5);
}

.left-zone {
  transform-style: preserve-3d;
  display: grid;
  grid-template-rows: auto 1fr;
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

.attack-zone {
  border: solid 1px #985e25;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &::after {
    content: 'Attack Zone';
    position: absolute;
    top: var(--size-1);
    left: var(--size-3);
    color: #d7ad42;
    font-size: var(--font-size-0);
  }
}

.defense-zone {
  border: solid 1px #985e25;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &::after {
    content: 'Defense Zone';
    position: absolute;
    top: var(--size-1);
    left: var(--size-3);
    color: #d7ad42;
    font-size: var(--font-size-0);
  }
}

:is(.attack-zone, .defense-zone) {
  &.is-dragging {
    background-color: hsla(260, 50%, 20%, 0.2);
    box-shadow: 0 0 30px #985e25;
    &:hover {
      border-color: cyan;
      box-shadow: 0 0 10px cyan;
      background-color: hsla(from cyan h s l / 0.15);
    }
  }
}
:global(.destiny-zone .game-card) {
  transform: rotateY(180deg);
}

.piles-zone {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: var(--size-7);
  column-gap: var(--size-4);
  place-content: center;
  transform-style: preserve-3d;
}
</style>
