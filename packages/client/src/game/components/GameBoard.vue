<script setup lang="ts">
import {
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer
} from '../composables/useGameClient';
import BoardSpace from './BoardSpace.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';
import GameCard from './GameCard.vue';
import { useWindowSize } from '@vueuse/core';
import { config } from '@/utils/config';
import PassButton from './PassButton.vue';
import BoardCard from './BoardCard.vue';
import EffectChain from './EffectChain.vue';
import MyHero from './MyHero.vue';
import ScoreButton from './ScoreButton.vue';

const { clocks } = defineProps<{
  clocks?: {
    [playerId: string]: {
      max: number;
      remaining: number;
      isActive: boolean;
    };
  };
}>();

const ui = useGameUi();
const state = useGameState();
const myPlayer = useMyPlayer();
const opponent = useOpponentPlayer();

const { height } = useWindowSize();
const boardScale = computed(() => {
  return 1;
  // const scaleX = width.value / config.BOARD_SIZE.x;
  // const scaleY = height.value / config.BOARD_SIZE.y;
  // return Math.min(scaleX, scaleY);
});

const boardMargin = computed(() => {
  // const scaledBoardWidth = config.BOARD_SIZE.x * boardScale.value;
  const scaledBoardHeight = config.BOARD_SIZE.y * boardScale.value;
  return {
    // x: (width.value - scaledBoardWidth) / 2,
    x: 0,
    y: (height.value - scaledBoardHeight) / 2
  };
});
</script>

<template>
  <div class="board" :id="ui.DOMSelectors.board.id">
    <div class="opponent-hero">
      <div class="victory-points">
        <div
          v-for="point in state.config.VICTORY_POINTS_TO_WIN"
          :key="point"
          class="victory-point"
          :class="{ empty: opponent.victoryPoints < point }"
        />
      </div>
      <BoardCard
        v-if="opponent.hero"
        :card="opponent.hero"
        @mouseenter="ui.hover(opponent.hero)"
        @mouseleave="ui.unhover()"
      />
    </div>

    <div class="minions-zone">
      <div class="opponent-base zone">
        <BoardSpace
          v-for="space in opponent.base"
          :key="space.id"
          :cell-id="space.id"
        />
      </div>
      <div class="opponent-battlefields">
        <div class="zone">
          <ScoreButton
            class="opponent-left-score"
            :battlefield="opponent.leftBattlefield"
          />

          <div class="opponent-left-destiny">
            <InspectableCard
              v-if="opponent.leftBattlefield.destinyCard"
              :card-id="opponent.leftBattlefield.destinyCard.id"
            >
              <GameCard
                :card-id="opponent.leftBattlefield.destinyCard.id"
                variant="small"
                :is-interactive="false"
              />
            </InspectableCard>
          </div>
          <BoardSpace
            v-for="space in opponent.leftBattlefield.spaces"
            :key="space.id"
            :cell-id="space.id"
          />
        </div>
        <div class="zone">
          <BoardSpace
            v-for="space in opponent.rightBattlefield.spaces"
            :key="space.id"
            :cell-id="space.id"
          />

          <div class="opponent-right-destiny">
            <InspectableCard
              v-if="opponent.rightBattlefield.destinyCard"
              :card-id="opponent.rightBattlefield.destinyCard.id"
              :open-delay="300"
            >
              <GameCard
                :card-id="opponent.rightBattlefield.destinyCard.id"
                variant="small"
                :is-interactive="false"
              />
            </InspectableCard>
          </div>
          <ScoreButton
            class="opponent-right-score"
            :battlefield="opponent.rightBattlefield"
          />
        </div>
      </div>
      <div class="my-battlefields">
        <div class="zone">
          <div class="my-left-destiny">
            <InspectableCard
              v-if="myPlayer.leftBattlefield.destinyCard"
              :card-id="myPlayer.leftBattlefield.destinyCard.id"
              :open-delay="300"
            >
              <GameCard
                :card-id="myPlayer.leftBattlefield.destinyCard.id"
                variant="small"
                :is-interactive="false"
              />
            </InspectableCard>
          </div>
          <BoardSpace
            v-for="space in myPlayer.leftBattlefield.spaces"
            :key="space.id"
            :cell-id="space.id"
          />
          <ScoreButton
            class="my-left-score"
            :battlefield="myPlayer.leftBattlefield"
          />
        </div>
        <div class="zone">
          <BoardSpace
            v-for="space in myPlayer.rightBattlefield.spaces"
            :key="space.id"
            :cell-id="space.id"
          />
          <div class="my-right-destiny">
            <InspectableCard
              v-if="myPlayer.rightBattlefield.destinyCard"
              :card-id="myPlayer.rightBattlefield.destinyCard.id"
              :open-delay="300"
            >
              <GameCard
                :card-id="myPlayer.rightBattlefield.destinyCard.id"
                variant="small"
                :is-interactive="false"
              />
            </InspectableCard>
          </div>
          <ScoreButton
            class="my-right-score"
            :battlefield="myPlayer.rightBattlefield"
          />
        </div>
      </div>
      <div class="my-base zone">
        <BoardSpace
          v-for="space in myPlayer.base"
          :key="space.id"
          :cell-id="space.id"
        />
      </div>
      <div class="right-side">
        <PassButton />
        <div class="flex gap-2">
          <div
            v-for="(clock, userId) of clocks"
            :key="userId"
            class="action-clock"
            :class="{
              active: clock.isActive,
              warning: clock.remaining < 15
            }"
            :style="{ '--max': clock.max, '--remaining': clock.remaining }"
            :data-count="clock.remaining"
          ></div>
        </div>
        .
      </div>
    </div>

    <div class="my-hero">
      <div class="victory-points">
        <div
          v-for="point in state.config.VICTORY_POINTS_TO_WIN"
          :key="point"
          class="victory-point"
          :class="{ empty: myPlayer.victoryPoints < point }"
        />
      </div>
      <MyHero />
      <EffectChain class="effect-chain" />
    </div>

    <div id="card-actions-portal" class="absolute"></div>
    <div class="arrows" id="arrows" />
  </div>
</template>

<style scoped lang="postcss">
.board {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-inline: auto;
  transform-style: preserve-3d;
  transform-origin: top left;
  width: 100%;
  height: 100%;
  /* width: var(--board-width);
  height: var(--board-height); */
  background: url(@/assets/backgrounds/battle-background-hirez.png);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  padding-bottom: 5dvh;
  /* transform: scale(v-bind('boardScale'))
    translateX(calc(v-bind('boardMargin.x') * 1px))
    translateY(calc(v-bind('boardMargin.y') * 1px)); */
  --offset-y: calc(v-bind('boardMargin.y') * 1px);
  /* background-position: center calc(var(--offset-y) * -0.5); */
  /* transform: translateY(var(--offset-y)); */
}

.minions-zone {
  width: 1200px;
  height: 621px;
  background: url(@/assets/ui/board-hirez.png);
  background-size: cover;
  margin-inline: auto;
  margin-block-start: -10px;
  padding-block: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  translate: 0 -8px;
  .zone {
    height: 130px;
    display: flex;
    justify-content: space-between;
  }
}

.opponent-left-destiny,
.my-left-destiny {
  position: absolute;
  top: 0;
  left: 0;
}

.opponent-left-destiny {
  translate: -125% -10%;
}

.my-left-destiny {
  translate: -125% 10%;
}

.opponent-right-destiny,
.my-right-destiny {
  position: absolute;
  top: 0;
  right: 0;
}

.opponent-right-destiny {
  translate: 125% -10%;
}

.my-right-destiny {
  translate: 125% 25%;
}

.arrows {
  transform: translateZ(10px);
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

#card-actions-portal {
  transform: translateZ(10px);
}

/* @keyframes warning-pulse {
  0%,
  100% {
    color: white;
  }
  50% {
    color: red;
  }
} */

.action-clock {
  --color: #ffb270;
  aspect-ratio: 1;
  border: 2px solid #985e25;
  border-radius: 50%;
  position: relative;
  height: 80px;
  aspect-ratio: 1;
  --colored-angle: calc(360deg * (var(--remaining) / var(--max)));
  --transparent-angle: calc(360deg - var(--colored-angle));
  background: conic-gradient(
    transparent 0deg,
    transparent var(--transparent-angle),
    var(--color) calc(360deg * (var(--remaining) / var(--max))),
    var(--color) 360deg
  );

  &:not(.active) {
    opacity: 0.25;
  }
  &::before {
    content: attr(data-count);
    position: absolute;
    top: 50%;
    left: 50%;
    width: 75%;
    transform: translate(-50%, -50%);
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-5);
    color: var(--color);
    font-weight: var(--font-weight-5);
    background-color: black;
    border-radius: var(--radius-round);
  }

  &::after {
    content: attr(data-label);
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: var(--font-size-00);
    font-weight: var(--font-weight-7);
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.1ch;
    -webkit-text-stroke: 4px black;
    paint-order: stroke fill;
  }

  &.active.warning::after {
    animation: warning-pulse 1s infinite;
  }
}

.opponent-base {
  position: absolute;
  width: 930px;
  left: 50%;
  translate: -50% 0;
}

.opponent-battlefields {
  position: absolute;
  top: 165px;
  display: flex;
  padding-inline: 22px;
  justify-content: space-between;
  width: 100%;

  .zone {
    width: 502px;
    padding-inline: 10px;
    position: relative;
  }
}

.my-battlefields {
  position: absolute;
  top: 318px;
  display: flex;
  padding-inline: 22px;
  justify-content: space-between;
  width: 100%;

  .zone {
    width: 502px;
    padding-inline: 10px;
    position: relative;
  }
}

.my-base {
  position: absolute;
  width: 930px;
  left: 50%;
  translate: -50% 0;
  top: 476px;
}

.right-side {
  position: absolute;
  left: 1180px;
  top: 288px;
}

.my-hero {
  align-self: start;
  display: flex;
  gap: var(--size-4);
  width: 50%;
  translate: calc(50vw - (var(--card-small-width) / 2)) 0;
}

.opponent-hero {
  align-self: center;
  translate: 0 -20px;
}

.effect-chain {
  flex-grow: 1;
}

.opponent-left-score {
  top: 80%;
  right: -65px;
}

.my-left-score {
  top: -7px;
  right: -65px;
}

.opponent-right-score {
  top: 80%;
  left: -60px;
}

.my-right-score {
  top: -7px;
  left: -60px;
}

.victory-points {
  display: grid;
  grid-template-columns: repeat(8, 47px);
  gap: 4px;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: calc(100% + var(--size-3));
  top: 50%;
  translate: 0 -50%;
}
.victory-point {
  width: 47px;
  height: 48px;
  background: url('@/assets/ui/score.png');
  &.empty {
    background: url('@/assets/ui/score-empty.png');
  }
}
</style>
