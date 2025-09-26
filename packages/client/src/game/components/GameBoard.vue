<script setup lang="ts">
import {
  useFxEvent,
  useMyBoard,
  useMyPlayer,
  useOpponentBoard,
  useOpponentPlayer
} from '../composables/useGameClient';
import Hand from '@/game/components/Hand.vue';
import ExplainerMessage from './ExplainerMessage.vue';
import Deck from './Deck.vue';

import GameCard from './GameCard.vue';
import ActionsButtons from './ActionsButtons.vue';
import DiscardPile from './DiscardPile.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { SerializedGame } from '@game/engine/src/game/game';
import { isDefined, type Nullable } from '@game/shared';
import UiModal from '@/ui/components/UiModal.vue';
import UiButton from '@/ui/components/UiButton.vue';
import DestinyZone from './DestinyZone.vue';
import DestinyDeck from './DestinyDeck.vue';
import EffectChain from './EffectChain.vue';
import BanishPile from './BanishPile.vue';
import MinionSlot from './MinionSlot.vue';
import OpponentHand from './OpponentHand.vue';
import BattleLog from './BattleLog.vue';
// import { useBoardResize } from '../composables/useBoardResize';

const myBoard = useMyBoard();
const myPlayer = useMyPlayer();
const opponentBoard = useOpponentBoard();
const opponentPlayer = useOpponentPlayer();

const board = useTemplateRef('board');
// useBoardResize(board);

const error = ref(
  null as Nullable<{
    error: string;
    isFatal: boolean;
    debugDump: SerializedGame;
  }>
);
useFxEvent(FX_EVENTS.ERROR, async e => {
  error.value = e;
});

const router = useRouter();
</script>

<template>
  <!-- <ManaCostModal /> -->
  <!-- <BattleLog />
  <SVGFilters /> -->
  <!-- <DestinyPhaseModal v-if="hasFinishedStartAnimation" /> -->
  <!-- <ChooseCardModal />
  <CombatArrows />
  <PlayedCardIntent />
  <PlayedCard />
  <DestinyCostVFX /> -->
  <!--
  <div class="explainer">
    <ExplainerMessage />
  </div> -->

  <div class="board-perspective-wrapper">
    <div class="board" id="board" ref="board">
      <ExplainerMessage class="explainer" />
      <div class="flex gap-3 justify-center">
        <div class="flex flex-col gap-3">
          <div class="flex-1 flex flex-col">
            <div class="text-center">Artifacts</div>
            <div class="artifacts"></div>
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
            <GameCard
              :card-id="myBoard.heroZone.hero"
              actions-side="bottom"
              :actions-offset="15"
            />
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
            <div>Back row</div>
            <MinionSlot
              v-for="slot in myBoard.backRow.slots"
              :key="slot.position"
              :minion-slot="slot"
            />
          </div>
          <div class="minion-row">
            <div>Front row</div>
            <MinionSlot
              v-for="slot in myBoard.frontRow.slots"
              :key="slot.position"
              :minion-slot="slot"
            />
          </div>
        </div>

        <div class="flex gap-3 h-full">
          <div class="minion-row">
            <div>Front row</div>

            <MinionSlot
              v-for="slot in opponentBoard.frontRow.slots"
              :key="slot.position"
              :minion-slot="slot"
            />
          </div>
          <div class="minion-row">
            <div>Back row</div>
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
            <div class="artifacts"></div>
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
            <GameCard :card-id="opponentBoard.heroZone.hero" />
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
    </div>
  </div>
  <div class="arrows" id="arrows" />

  <UiModal
    :is-opened="isDefined(error)"
    :closable="false"
    title="We hit a snag !"
    description=""
  >
    <div v-if="error?.isFatal">
      <p>The game encountered the following error :</p>
      <code class="block my-4">
        {{ error?.error }}
        {{ error.debugDump }}
      </code>
      <p>This error is fatal, the game cannot continue.</p>
      <UiButton
        class="error-button"
        @click="
          () => {
            console.log(error?.debugDump);
            router.push({ name: 'Home' });
          }
        "
      >
        Send Crash Report
      </UiButton>
    </div>
    <div v-else>
      <p>
        The game received an illegal action. If the issue persist, try
        restarting the game.
      </p>
      <code class="block my-4">
        {{ error?.error }}
      </code>

      <UiButton
        class="error-button"
        @click="
          () => {
            error = null;
          }
        "
      >
        Dismiss
      </UiButton>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
code {
  white-space: pre-wrap;
  max-height: var(--size-13);
  overflow-y: auto;
}
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
