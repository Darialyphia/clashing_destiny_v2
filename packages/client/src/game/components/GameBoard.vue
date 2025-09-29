<script setup lang="ts">
import {
  useMyBoard,
  useMyPlayer,
  useOpponentBoard,
  useOpponentPlayer
} from '../composables/useGameClient';
import Hand from '@/game/components/Hand.vue';
import ExplainerMessage from './ExplainerMessage.vue';
import Deck from './Deck.vue';

import ActionsButtons from './ActionsButtons.vue';
import DiscardPile from './DiscardPile.vue';
import DestinyZone from './DestinyZone.vue';
import DestinyDeck from './DestinyDeck.vue';
import EffectChain from './EffectChain.vue';
import BanishPile from './BanishPile.vue';
import MinionSlot from './MinionSlot.vue';
import OpponentHand from './OpponentHand.vue';
import BattleLog from './BattleLog.vue';
import EquipedArtifacts from './EquipedArtifacts.vue';
import HeroSlot from './HeroSlot.vue';
import CombatArrows from './CombatArrows.vue';
import PlayedCard from './PlayedCard.vue';
import SVGFilters from './SVGFilters.vue';
import ChooseCardModal from './ChooseCardModal.vue';
import { useGameKeyboardControls } from '../composables/useGameKeyboardControls';
import GameErrorModal from './GameErrorModal.vue';
import DestinyCostVFX from './DestinyCostVFX.vue';

// import { useBoardResize } from '../composables/useBoardResize';

const myBoard = useMyBoard();
const myPlayer = useMyPlayer();
const opponentBoard = useOpponentBoard();
const opponentPlayer = useOpponentPlayer();

// const board = useTemplateRef('board');
// useBoardResize(board);

useGameKeyboardControls();
</script>

<template>
  <SVGFilters />
  <DestinyCostVFX />
  <ChooseCardModal />
  <PlayedCard />
  <CombatArrows />

  <div class="board-perspective-wrapper">
    <div class="board" id="board" ref="board">
      <ExplainerMessage class="explainer" />
      <div class="flex gap-3 justify-center">
        <div class="flex flex-col gap-3">
          <div class="flex-1 flex flex-col">
            <div class="text-center">Artifacts</div>
            <div class="artifacts">
              <EquipedArtifacts :player="myPlayer" />
            </div>
          </div>

          <div class="mb-4">
            <div class="card-container">
              <DestinyDeck :player-id="myPlayer.id" />
            </div>
            <div class="text-center">Destiny deck</div>
          </div>

          <div>
            <div class="card-container">
              <Deck :size="myPlayer.remainingCardsInMainDeck" />
            </div>
            <div class="text-center">Main deck</div>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center">
          <div />
          <div class="hero-slot">
            {{ myPlayer.name }}
            <HeroSlot :player="myPlayer" />
          </div>

          <div class="flex gap-2 mt-auto">
            <div class="mt-auto">
              <div class="card-container">
                <DiscardPile :player="myPlayer.id" />
              </div>
              <div class="text-center">Discard pile</div>
            </div>
            <div>
              <div class="card-container">
                <BanishPile :player="myPlayer.id" />
              </div>
              <div class="text-center">Banish pile</div>
            </div>
          </div>
        </div>
      </div>

      <div class="minions-zone">
        <div class="flex gap-3 h-full">
          <div class="minion-row">
            <div>Back line</div>
            <MinionSlot
              v-for="slot in myBoard.backRow.slots"
              :key="slot.position"
              :minion-slot="slot"
            />
          </div>
          <div class="minion-row">
            <div>Front line</div>
            <MinionSlot
              v-for="slot in myBoard.frontRow.slots"
              :key="slot.position"
              :minion-slot="slot"
            />
          </div>
        </div>

        <div class="flex gap-3 h-full">
          <div class="minion-row">
            <div>Front line</div>

            <MinionSlot
              v-for="slot in opponentBoard.frontRow.slots"
              :key="slot.position"
              :minion-slot="slot"
            />
          </div>
          <div class="minion-row">
            <div>Back line</div>
            <MinionSlot
              v-for="slot in opponentBoard.backRow.slots"
              :key="slot.position"
              :minion-slot="slot"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3 flex-row-reverse justify-center">
        <div class="flex flex-col gap-3">
          <div class="flex-1 flex flex-col">
            <div class="text-center">Artifacts</div>
            <div class="artifacts">
              <EquipedArtifacts :player="opponentPlayer" />
            </div>
          </div>
          <div>
            <div class="card-container">
              <Deck :size="opponentPlayer.remainingCardsInDestinyDeck" />
            </div>
            <div class="text-center">Destiny deck</div>
          </div>
          <div>
            <div class="card-container">
              <Deck :size="opponentPlayer.remainingCardsInMainDeck" />
            </div>
            <div class="text-center">Main deck</div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center">
          <div class="hero-slot">
            {{ opponentPlayer.name }}
            <HeroSlot :player="opponentPlayer" />
          </div>

          <div class="flex gap-2 mt-auto">
            <div class="mt-auto">
              <div class="card-container">
                <BanishPile :player="opponentPlayer.id" />
              </div>
              <div class="text-center">Banish pile</div>
            </div>
            <div>
              <div class="card-container">
                <DiscardPile :player="opponentPlayer.id" />
              </div>
              <div class="text-center">Discard pile</div>
            </div>
          </div>
        </div>
      </div>

      <section class="p1-destiny flex gap-2">
        <span>Destiny</span>
        <div class="flex-1">
          <DestinyZone :player-id="myPlayer.id" />
        </div>
      </section>

      <section>
        <EffectChain />
      </section>

      <section class="p2-destiny flex gap-2">
        <div class="flex-1">
          <DestinyZone :player-id="opponentPlayer.id" />
        </div>
        <span>Destiny</span>
      </section>

      <BattleLog class="battle-log" />
      <OpponentHand class="opponent-hand" />
      <Hand class="my-hand" />
      <ActionsButtons />
      <div class="arrows" id="arrows" />
    </div>
  </div>

  <GameErrorModal />
</template>

<style scoped lang="postcss">
.board-perspective-wrapper {
  perspective: 2500px;
  perspective-origin: center top;
  margin-inline: auto;
  background-size: cover;
  display: flex;
  justify-content: center;
  height: 100dvh;
}
.board {
  --pixel-scale: 1;
  background: url('/assets/backgrounds/board.png');
  background-size: cover;
  filter: brightness(1);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: min-content 1fr auto auto;
  row-gap: var(--size-4);
  column-gap: var(--size-2);
  scale: var(--board-scale, 1);
  transform-style: preserve-3d;
  transform-origin: top left;
  position: relative;
  font-family: 'Lato', sans-serif;
  font-size: var(--font-size-0);
  color: #985e25;
  padding-inline: var(--size-6);
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.explainer {
  grid-column: 1 / -1;
}

.card-container {
  --padding: 2px;
  border: solid 1px #985e25;
  width: calc(var(--card-small-width) + var(--padding) * 2);
  height: calc(var(--card-small-height) + var(--padding) * 2);
}

.minions-zone {
  display: flex;
  gap: var(--size-10);
}

.minion-row {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  > *:nth-child(2) {
    margin-top: calc(-1 * var(--size-4));
  }
}

.artifacts {
  --padding: 2px;
  border: solid 1px #985e25;
  flex-grow: 1;
}

.my-hand {
  height: calc(var(--card-height) * 0.5 * 2);
  grid-column: 1 / -1;
  grid-row: 4;
}

.battle-log {
  grid-column: 2;
  grid-row: 4;
}

.opponent-hand {
  grid-column: 3;
  grid-row: 4;
}

.hero-slot {
  --pixel-scale: 2;
  width: calc(var(--card-width) * 2);
  height: calc(var(--card-height) * 2);
}

.p1-destiny,
.p2-destiny {
  > span {
    writing-mode: vertical-rl;
    text-orientation: upright;
  }
}

#arrows {
  position: fixed;
  z-index: 1;
  inset: 0;
  pointer-events: none;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}
:global(#arrows > *) {
  grid-column: 1;
  grid-row: 1;
}
</style>
