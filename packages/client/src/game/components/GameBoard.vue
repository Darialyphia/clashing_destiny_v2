<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import {
  useGameClient,
  useGameState,
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
import CardResizer from './CardResizer.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import DestinyPhaseModal from './DestinyPhaseModal.vue';
import AffinityModal from './AffinityModal.vue';

const client = useGameClient();
const state = useGameState();
const board = useTemplateRef('board');
useBoardResize(board);
const { isFullscreen } = useFullscreen(document.body);
const myBoard = useMyBoard();
const opponentBoard = useOpponentBoard();
document.addEventListener('fullscreenchange', () => {
  console.log(document.fullscreenElement);
});

const canEndTurn = computed(() => {
  return (
    state.value.phase.state === GAME_PHASES.MAIN &&
    client.value.playerId === state.value.turnPlayer
  );
});
</script>

<template>
  <ManaCostModal />
  <DestinyPhaseModal />
  <AffinityModal />

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
      <section class="opponent-side">
        <div class="hero-zone debug">
          <div class="hero">
            <InspectableCard :card-id="opponentBoard.heroZone.hero">
              <GameCard :card-id="opponentBoard.heroZone.hero" />
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
              v-for="slot in opponentBoard.attackZone.slots"
              :key="slot.position"
              :slot="slot"
            />
          </div>
          <div class="minion-row">
            <MinionSlot
              v-for="slot in opponentBoard.defenseZone.slots"
              :key="slot.position"
              :slot="slot"
            />
          </div>
        </div>
        <div class="deck-zone">
          <div class="two-card-pile debug">
            <div class="card"></div>
            <div class="card"></div>
          </div>
          <div class="two-card-pile debug">
            <UiSimpleTooltip>
              <template #trigger>
                <div class="deck">
                  <CardResizer
                    v-for="i in opponentBoard.mainDeck.remaining"
                    :key="i"
                    :style="{ '--i': i - 1 }"
                  >
                    <CardBack class="deck-card" />
                  </CardResizer>
                </div>
              </template>
              Opponent's Main Deck: {{ opponentBoard.mainDeck.remaining }} cards
            </UiSimpleTooltip>

            <UiSimpleTooltip>
              <template #trigger>
                <div class="deck">
                  <CardResizer
                    v-for="i in opponentBoard.destinyDeck.remaining"
                    :key="i"
                    :style="{ '--i': i - 1 }"
                  >
                    <CardBack class="deck-card" />
                  </CardResizer>
                </div>
              </template>
              Opponent's Destiny Deck:
              {{ opponentBoard.destinyDeck.remaining }} cards
            </UiSimpleTooltip>
          </div>
          <DestinyZone :player-id="opponentBoard.playerId" />
        </div>
      </section>

      <div class="explainer">
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.DRAW }"
        >
          DRAW
        </div>
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.DESTINY }"
        >
          DESTINY
        </div>
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.MAIN }"
        >
          MAIN
        </div>
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.ATTACK }"
        >
          COMBAT
        </div>
        <div
          class="phase"
          :class="{ active: state.phase.state === GAME_PHASES.END }"
        >
          END
        </div>
        <p class="ml-auto">TODO Current interaction explainer message</p>
      </div>
      <section class="my-side">
        <div class="hero-zone debug">
          <div class="hero">
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
        <div class="deck-zone">
          <div class="two-card-pile debug">
            <div class="card"></div>
            <div class="card"></div>
          </div>
          <div class="two-card-pile debug">
            <UiSimpleTooltip>
              <template #trigger>
                <div class="deck">
                  <CardResizer
                    v-for="i in myBoard.mainDeck.remaining"
                    :key="i"
                    :style="{ '--i': i - 1 }"
                  >
                    <CardBack class="deck-card" />
                  </CardResizer>
                </div>
              </template>
              YourMain Deck: {{ myBoard.mainDeck.remaining }} cards
            </UiSimpleTooltip>

            <UiSimpleTooltip>
              <template #trigger>
                <div class="deck">
                  <CardResizer
                    v-for="i in myBoard.destinyDeck.remaining"
                    :key="i"
                    :style="{ '--i': i - 1 }"
                  >
                    <CardBack class="deck-card" />
                  </CardResizer>
                </div>
              </template>
              Your Destiny Deck: {{ myBoard.destinyDeck.remaining }} cards
            </UiSimpleTooltip>
          </div>
          <DestinyZone :player-id="myBoard.playerId" />
        </div>
      </section>
    </section>
    <Hand />
    <div class="action-buttons">
      <FancyButton
        v-if="state.effectChain"
        text="Pass chain"
        @click="
          client.adapter.dispatch({
            type: 'passChain',
            payload: {
              playerId: client.playerId
            }
          })
        "
      />
      <FancyButton
        text="End turn"
        :disabled="!canEndTurn"
        @click="
          client.adapter.dispatch({
            type: 'declareEndTurn',
            payload: {
              playerId: client.playerId
            }
          })
        "
      />
    </div>
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
  --board-height: 90dvh;
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  height: ar(--board-height);
  row-gap: var(--size-5);
  padding-inline: 20rem;
  transform: rotateX(30deg) translateY(-225px) scale(var(--board-scale));
  transform-style: preserve-3d;
  padding-inline: var(--size-12);
}

:global(.board *) {
  transform-style: preserve-3d;
}

.explainer {
  font-size: var(--font-size-4);
  display: flex;
  gap: var(--size-3);
  align-items: center;

  > p {
    transform: rotateX(-30deg);
    font-size: inherit;
  }
}
.phase {
  border: solid 2px white;
  border-radius: var(--radius-2);
  padding: var(--size-2) var(--size-3);
  font-size: var(--font-size-3);
  &.active {
    border-color: var(--cyan-4);
  }
}

.opponent-side,
.my-side {
  display: grid;
  gap: var(--size-2);
  grid-template-columns: 0.6fr 2fr 0.6fr;
  > * {
    height: calc(var(--board-height) / 2);
  }
}

.opponent-side {
  transform: rotateZ(180deg);
}

.hero-zone {
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: 3fr 1.5fr 1fr;
  gap: var(--size-2);

  .hero {
    justify-self: center;
    aspect-ratio: var(--card-ratio);
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
    gap: var(--size-2);
    padding-inline: var(--size-2);
  }
  .location {
    justify-self: center;
  }
}

.minion-zone {
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: 50% 50%;
  gap: var(--size-2);

  .minion-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    justify-items: center;
    > * {
      aspect-ratio: var(--card-ratio);
    }
    align-items: center;
  }
}

.deck-zone {
  display: grid;
  grid-auto-flow: row;
  gap: var(--size-2);
  grid-template-rows: minmax(0, 2fr) minmax(0, 2fr) minmax(0, 1.8fr);

  .two-card-pile {
    display: grid;
    grid-template-columns: 1fr 1fr;
    place-items: center;
    gap: var(--size-2);
    > * {
      height: 100%;
      aspect-ratio: var(--card-ratio);
    }
  }
}

.deck {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  > * {
    grid-row: 1;
    grid-column: 1;
    transform: translateZ(calc(var(--i) * 0.8px));
    height: 100%;
    /* aspect-ratio: var(--card-ratio); */
  }

  .deck-card {
    height: 100%;
    aspect-ratio: var(--card-ratio);
  }
}

.debug-tools {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
  padding: var(--size-3);
  background-color: rgba(0, 0, 0, 0.5);
}

.action-buttons {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  bottom: var(--size-3);
  right: var(--size-3);
  z-index: 2;
  align-items: center;
}
</style>
