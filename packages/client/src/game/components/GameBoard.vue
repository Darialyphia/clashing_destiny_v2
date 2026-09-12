<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer
} from '../composables/useGameClient';
import BoardSpace from './BoardSpace.vue';
import BoardCard from './BoardCard.vue';
import { useWindowSize } from '@vueuse/core';
import { config } from '@/utils/config';
import PassButton from './PassButton.vue';
import type { PlayerClockState } from '../composables/useGameSocket';
import Battlefield from './Battlefield.vue';
import RuneZone from './RuneZone.vue';

const { clocks } = defineProps<{
  clocks?: Record<string, PlayerClockState>;
}>();

const ui = useGameUi();
const state = useGameState();
const { client } = useGameClient();
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

const pointsToWin = computed(() => state.value.config.VICTORY_POINTS_TO_WIN);

const hasInitiative = computed(() => {
  return client.value.getActivePlayerIds().includes(myPlayer.value.id);
});

const opponentHasInitiative = computed(() => {
  return client.value.getActivePlayerIds().includes(opponent.value.id);
});
</script>

<template>
  <div class="board" :id="ui.DOMSelectors.board.id">
    <div class="minions-zone" :id="ui.DOMSelectors.boardInner.id">
      <div class="left-destiny">
        <Battlefield :battlefield="myPlayer.leftBattlefield" />
      </div>
      <div class="right-destiny">
        <Battlefield :battlefield="myPlayer.rightBattlefield" />
      </div>

      <div class="opponent-base zone">
        <BoardSpace
          v-for="space in opponent.base"
          :key="space.id"
          :cell-id="space.id"
        />
      </div>
      <div class="opponent-battlefields">
        <div class="zone">
          <div class="secret-zone">
            <BoardCard
              v-if="opponent.leftBattlefield.secretCard"
              :card="opponent.leftBattlefield.secretCard"
            />
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
          <div class="secret-zone">
            <BoardCard
              v-if="opponent.rightBattlefield.secretCard"
              :card="opponent.rightBattlefield.secretCard"
            />
          </div>
        </div>
      </div>
      <div class="my-battlefields">
        <div class="zone">
          <div class="secret-zone">
            <BoardCard
              v-if="myPlayer.leftBattlefield.secretCard"
              :card="myPlayer.leftBattlefield.secretCard"
            />
          </div>
          <BoardSpace
            v-for="space in myPlayer.leftBattlefield.spaces"
            :key="space.id"
            :cell-id="space.id"
          />
        </div>
        <div class="zone">
          <BoardSpace
            v-for="space in myPlayer.rightBattlefield.spaces"
            :key="space.id"
            :cell-id="space.id"
          />
          <div class="secret-zone">
            <BoardCard
              v-if="myPlayer.rightBattlefield.secretCard"
              :card="myPlayer.rightBattlefield.secretCard"
            />
          </div>
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
        <div class="flex gap-2">
          <div
            v-for="(clock, userId) of clocks"
            :key="userId"
            class="player-clocks"
            :class="{ penalized: clock.isPenalized }"
          >
            <div
              v-for="(stage, stageName) of [clock.primary, clock.secondary]"
              :key="stageName"
              class="action-clock"
              :class="{
                active: stage.isActive,
                warning: stage.remaining < 15
              }"
              :style="{ '--max': stage.max, '--remaining': stage.remaining }"
              :data-count="stage.remaining"
              :data-label="stageName === 0 ? 'turn' : 'grace'"
            ></div>
          </div>
        </div>
        .
      </div>

      <div class="middle-side">
        <div class="victory-points">
          <div
            v-for="point in state.config.VICTORY_POINTS_TO_WIN"
            :key="point"
            class="victory-point"
            :class="{ empty: opponent.victoryPoints < point }"
          />
        </div>
        <div
          class="initiative-indicator opponent"
          :class="{ active: opponentHasInitiative }"
        />
        <PassButton class="pass-button" />
        <div class="initiative-indicator" :class="{ active: hasInitiative }" />
        <div class="victory-points">
          <div
            v-for="point in state.config.VICTORY_POINTS_TO_WIN"
            :key="point"
            class="victory-point"
            :class="{ empty: myPlayer.victoryPoints < point }"
          />
        </div>
      </div>

      <div class="my-rune-zone">
        <RuneZone :player="myPlayer" />
      </div>

      <div class="opponent-rune-zone">
        <RuneZone :player="opponent" />
      </div>
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
  background: url(@/assets/backgrounds/battle-background2.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* transform: scale(v-bind('boardScale'))
    translateX(calc(v-bind('boardMargin.x') * 1px))
    translateY(calc(v-bind('boardMargin.y') * 1px)); */
  --offset-y: calc(v-bind('boardMargin.y') * 1px);
  /* background-position: center calc(var(--offset-y) * -0.5); */
  /* transform: translateY(var(--offset-y)); */
}

.minions-zone {
  width: 1188px;
  height: 548px;
  background: url(@/assets/ui/board-v2.png);
  background-size: cover;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: absolute;
  top: 52%;
  left: 50%;
  translate: -50% calc(-50% - 40px);
  transform-style: preserve-3d;
  .zone {
    transform-style: preserve-3d;
    height: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.left-destiny {
  position: absolute;
  top: 228px;
  left: 200px;
}

.right-destiny {
  position: absolute;
  top: 228px;
  right: 195px;
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
  top: 10px;
  width: calc(
    var(--card-small-v3-width) * 6 + var(--size-4) * 5 - var(--size-3) * 2
  );
  left: 50%;
  translate: -50% 0;
}

.opponent-battlefields {
  position: absolute;
  top: 115px;
  display: flex;
  padding-inline: 22px;
  justify-content: space-between;
  width: 100%;

  .zone {
    width: 450px;
    padding-inline: 10px;
    position: relative;
    display: flex;
    justify-content: center;
    gap: var(--size-2);
  }
}

.my-battlefields {
  position: absolute;
  top: 325px;
  display: flex;
  padding-inline: 22px;
  justify-content: space-between;
  width: 100%;
  .zone {
    width: 450px;
    padding-inline: 10px;
    position: relative;
    display: flex;
    justify-content: center;
    gap: var(--size-2);
  }
}

.my-base {
  position: absolute;
  top: 430px;
  width: calc(
    var(--card-small-v3-width) * 6 + var(--size-4) * 5 - var(--size-3) * 2
  );
  left: 50%;
  translate: -50% 0;
}

.right-side {
  position: absolute;
  left: 1180px;
  top: 288px;
}

.victory-points {
  display: grid;
  grid-template-columns: repeat(v-bind('pointsToWin'), 27px);
  gap: 3px;
  align-items: center;
  justify-content: center;
}
.victory-point {
  width: 27px;
  height: 26px;
  background: url('@/assets/ui/score.png');
  &.empty {
    background: url('@/assets/ui/score-empty.png');
  }
}

.middle-side {
  position: absolute;
  top: 270px;
  left: 50%;
  height: 320px;
  translate: -50% -50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--size-2);
  width: 212px;
}

.initiative-indicator {
  width: 44px;
  height: 23px;
  background: url('@/assets/ui/initiative-indicator.png');
  background-size: cover;
  margin-block: 10px;
  &.opponent {
    transform: scaleY(-1);
  }
  &:not(.active) {
    opacity: 0;
  }
}

.my-rune-zone {
  position: absolute;
  bottom: 10px;
  right: -80px;
}
.opponent-rune-zone {
  position: absolute;
  top: 10px;
  right: -80px;
}

.secret-zone {
  width: var(--card-small-v3-width);
  height: var(--card-small-v3-height);
}
</style>
