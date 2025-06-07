<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import {
  useGameClient,
  useMyBoard,
  useOpponentBoard
} from '../composables/useGameClient';
import { useBoardResize } from '../composables/useBoardResize';
import CardBack from '@/card/components/CardBack.vue';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';
import Hand from '@/card/components/Hand.vue';
import ManaCostModal from './ManaCostModal.vue';
import MinionSlot from './MinionSlot.vue';
import DestinyZone from './DestinyZone.vue';

const client = useGameClient();

const board = useTemplateRef('board');
useBoardResize(board);
const { isFullscreen } = useFullscreen(document.body);
const myBoard = useMyBoard();
const opponentBoard = useOpponentBoard();
document.addEventListener('fullscreenchange', () => {
  console.log(document.fullscreenElement);
});
</script>

<template>
  <ManaCostModal />
  <div class="board-container">
    <div class="debug-tools">
      <button
        @click="
          () => {
            console.log(client);
          }
        "
      >
        Debug client
      </button>
    </div>
    <section
      class="board"
      :class="{ 'full-screen': isFullscreen }"
      :style="{ '--board-scale': 1 }"
      ref="board"
    >
      <section class="opponent-side debug">
        <div class="talent-zone debug">
          <div class="talent"></div>
          <div class="talent"></div>
          <div class="talent"></div>
          <div class="talent"></div>
        </div>
        <div class="hero-zone debug">
          <div class="location card-turned debug"></div>
          <div class="artifacts">
            <div class="card"></div>
            <div class="card"></div>
            <div class="card"></div>
          </div>
          <div class="hero card">
            <InspectableCard :card-id="opponentBoard.heroZone.hero">
              <GameCard :card-id="opponentBoard.heroZone.hero" />
            </InspectableCard>
          </div>
        </div>
        <div class="minion-zone">
          <div class="minion-row debug">
            <MinionSlot
              v-for="slot in opponentBoard.defenseZone.slots"
              :key="slot.position"
              :slot="slot"
            />
          </div>
          <div class="minion-row">
            <MinionSlot
              v-for="slot in opponentBoard.attackZone.slots"
              :key="slot.position"
              :slot="slot"
            />
          </div>
        </div>
        <div class="deck-zone debug">
          <DestinyZone :player-id="opponentBoard.playerId" />

          <div class="two-card-pile debug">
            <div class="deck">
              <CardBack
                class="card"
                v-for="i in opponentBoard.mainDeck.remaining"
                :style="{ '--i': i - 1 }"
              />
            </div>
            <div class="deck">
              <CardBack
                class="card"
                v-for="i in opponentBoard.destinyDeck.remaining"
                :style="{ '--i': i - 1 }"
              />
            </div>
          </div>
          <div class="two-card-pile debug">
            <div class="card"></div>
            <div class="card"></div>
          </div>
        </div>
      </section>

      <section class="my-side">
        <div class="talent-zone debug">
          <div class="talent"></div>
          <div class="talent"></div>
          <div class="talent"></div>
          <div class="talent"></div>
        </div>
        <div class="hero-zone debug">
          <div class="hero card">
            <InspectableCard :card-id="myBoard.heroZone.hero">
              <GameCard :card-id="myBoard.heroZone.hero" />
            </InspectableCard>
          </div>
          <div class="artifacts">
            <div class="card"></div>
            <div class="card"></div>
            <div class="card"></div>
          </div>
          <div class="location card-turned debug"></div>
        </div>
        <div class="minion-zone">
          <div class="minion-row">
            <MinionSlot
              v-for="slot in myBoard.attackZone.slots"
              :key="slot.position"
              :slot="slot"
            />
          </div>
          <div class="minion-row">
            <MinionSlot
              v-for="slot in myBoard.defenseZone.slots"
              :key="slot.position"
              :slot="slot"
            />
          </div>
        </div>
        <div class="deck-zone debug">
          <div class="two-card-pile debug">
            <div class="card"></div>
            <div class="card"></div>
          </div>
          <div class="two-card-pile debug">
            <div class="deck">
              <CardBack
                class="card"
                v-for="i in myBoard.mainDeck.remaining"
                :style="{ '--i': i - 1 }"
              />
            </div>
            <div class="deck">
              <CardBack
                class="card"
                v-for="i in myBoard.destinyDeck.remaining"
                :style="{ '--i': i - 1 }"
              />
            </div>
          </div>
          <DestinyZone :player-id="myBoard.playerId" />
        </div>
      </section>
    </section>
    <Hand />
  </div>
</template>

<style scoped lang="postcss">
.board-container {
  margin: 0;
  height: 100dvh;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.card {
  aspect-ratio: var(--card-ratio);
  position: relative;
}

.card-turned {
  aspect-ratio: var(--card-ratio-inverted);
  position: relative;
}

.debug {
  > * {
    border: solid 1px white;
  }
}

.board {
  --board-scale: 1;
  --board-height: 105dvh;
  display: grid;
  grid-template-rows: 1fr 1fr;
  height: ar(--board-height);
  row-gap: 1.5rem;
  padding-inline: 5rem;
  transform: rotateX(30deg) translateY(-275px) scale(var(--board-scale));
  transform-style: preserve-3d;
  padding-inline: 10rem;
}

:global(.board *) {
  transform-style: preserve-3d;
}

.opponent-side,
.my-side {
  display: grid;
  grid-template-columns: auto auto minmax(50%, 1fr) auto;
  gap: 0.5rem;
  > * {
    /* hack for Firefox that doesnt handle aspect-ratio in auto sized grid columns correctly; */
    height: calc(var(--board-height) / 2);
  }
}

.talent-zone {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(4, 1fr);
  gap: 0.5rem;
  /* hack for Firefox that doesnt handle aspect-ratio in auto sized grid columns correctly; */
  aspect-ratio: 1 / 4;
  > * {
    aspect-ratio: 1;
  }
}

.hero-zone {
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: 1fr 1.5fr 3fr;
  gap: 0.5rem;
  .my-side & {
    grid-template-rows: 3fr 1.5fr 1fr;
  }

  .hero {
    justify-self: center;
    /* overflow: hidden; */
    position: relative;
    & > * {
      position: absolute;
      inset: 0;
    }
  }
  .artifacts {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    padding-inline: 0.5rem;
  }
  .location {
    justify-self: center;
  }
}

.minion-zone {
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: 50% 50%;
  gap: 0.5rem;

  .minion-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    /* justify-content: space-around;
    padding-block: 0.5rem; */
  }
}

.deck-zone {
  display: grid;
  grid-auto-flow: row;
  gap: 0.5rem;
  grid-template-rows: 2fr 2fr 1fr;

  .opponent-side & {
    grid-template-rows: 1fr 2fr 2fr;
  }

  .two-card-pile {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
}

.deck {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  --card-width: 50%;
  --card-height: 50%;
  > .card {
    grid-row: 1;
    grid-column: 1;
    transform: translateZ(calc(var(--i) * 0.8px));
  }
}

.debug-tools {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
