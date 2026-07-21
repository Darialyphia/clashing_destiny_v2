<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer,
  useOpponentPlayer
} from '../composables/useGameClient';
import BoardSpace from './BoardSpace.vue';
import { useWindowSize } from '@vueuse/core';
import { config } from '@/utils/config';
import PassButton from './PassButton.vue';
import BoardCard from './BoardCard.vue';
import EffectChain from './EffectChain.vue';
import MyHero from './MyHero.vue';
import ScoreButton from './ScoreButton.vue';
import { RUNES } from '@game/engine/src/player/player.enums';
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';

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
const { client } = useGameClient();
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

const isResourceActionMenuOpened = ref(false);
const canSelectHero = computed(() => {
  if (!ui.value.isInteractivePlayer) return false;
  if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
  if (!myPlayer.value.canTakeResourceAction) return false;
  return true;
});

const pointsToWin = computed(() => state.value.config.VICTORY_POINTS_TO_WIN);
</script>

<template>
  <div class="board" :id="ui.DOMSelectors.board.id">
    <div class="minions-zone">
      <div class="opponent-left-destiny">
        <BoardCard
          v-if="opponent.leftBattlefield.destinyCard"
          :card="opponent.leftBattlefield.destinyCard"
          @mouseenter="ui.hover(opponent.leftBattlefield.destinyCard)"
          @mouseleave="ui.unhover()"
        />
      </div>
      <div class="opponent-right-destiny">
        <BoardCard
          v-if="opponent.rightBattlefield.destinyCard"
          :card="opponent.rightBattlefield.destinyCard"
          @mouseenter="ui.hover(opponent.rightBattlefield.destinyCard)"
          @mouseleave="ui.unhover()"
        />
      </div>
      <div class="my-left-destiny">
        <BoardCard
          v-if="myPlayer.leftBattlefield.destinyCard"
          :card="myPlayer.leftBattlefield.destinyCard"
          @mouseenter="ui.hover(myPlayer.leftBattlefield.destinyCard)"
          @mouseleave="ui.unhover()"
        />
      </div>
      <div class="my-right-destiny">
        <BoardCard
          v-if="myPlayer.rightBattlefield.destinyCard"
          :card="myPlayer.rightBattlefield.destinyCard"
          @mouseenter="ui.hover(myPlayer.rightBattlefield.destinyCard)"
          @mouseleave="ui.unhover()"
        />
      </div>
      <ScoreButton
        class="opponent-left-score"
        :battlefield="opponent.leftBattlefield"
      />
      <ScoreButton
        class="opponent-right-score"
        :battlefield="opponent.rightBattlefield"
      />
      <ScoreButton
        class="my-left-score"
        :battlefield="myPlayer.leftBattlefield"
      />
      <ScoreButton
        class="my-right-score"
        :battlefield="myPlayer.rightBattlefield"
      />

      <div class="opponent-base zone">
        <BoardSpace
          v-for="space in opponent.base"
          :key="space.id"
          :cell-id="space.id"
        />
      </div>
      <div class="opponent-battlefields">
        <div class="zone">
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
        </div>
      </div>
      <div class="my-battlefields">
        <div class="zone">
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
      <div class="opponent-hero">
        <BoardCard
          v-if="opponent.hero"
          :card="opponent.hero"
          @mouseenter="ui.hover(opponent.hero)"
          @mouseleave="ui.unhover()"
        />
      </div>
      <div class="my-hero">
        <MyHero />
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
        <EffectChain class="effect-chain" />
        <div class="victory-points">
          <div
            v-for="point in state.config.VICTORY_POINTS_TO_WIN"
            :key="point"
            class="victory-point"
            :class="{ empty: myPlayer.victoryPoints < point }"
          />
        </div>

        <PassButton />

        <DropdownMenuRoot
          v-model:open="isResourceActionMenuOpened"
          :side="'top'"
          :align="'center'"
        >
          <DropdownMenuTrigger
            :disabled="!canSelectHero"
            class="resource-action-indicator"
          />
          <DropdownMenuPortal>
            <DropdownMenuContent>
              <div
                class="resource-actions-menu"
                v-if="isResourceActionMenuOpened"
              >
                <button
                  class="resource-action might"
                  @mouseup="
                    () => {
                      isResourceActionMenuOpened = false;
                      client.takeResourceAction({
                        type: 'rune',
                        rune: RUNES.MIGHT
                      });
                    }
                  "
                />
                <button
                  class="resource-action wisdom"
                  @mouseup="
                    () => {
                      isResourceActionMenuOpened = false;
                      client.takeResourceAction({
                        type: 'rune',
                        rune: RUNES.WISDOM
                      });
                    }
                  "
                />
                <button
                  class="resource-action focus"
                  @mouseup="
                    () => {
                      isResourceActionMenuOpened = false;
                      client.takeResourceAction({
                        type: 'rune',
                        rune: RUNES.FOCUS
                      });
                    }
                  "
                />
                <button
                  class="resource-action resonance"
                  @mouseup="
                    () => {
                      isResourceActionMenuOpened = false;
                      client.takeResourceAction({
                        type: 'rune',
                        rune: RUNES.RESONANCE
                      });
                    }
                  "
                />
                <button
                  class="resource-action draw"
                  @mouseup="
                    () => {
                      client.takeResourceAction({
                        type: 'draw'
                      });
                    }
                  "
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
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
  background: url(@/assets/backgrounds/battle-background-hirez.png);
  background-size: contain;
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
  width: 1350px;
  height: 685px;
  background: url(@/assets/ui/board.png);
  background-size: cover;
  margin-inline: auto;
  padding-block: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% calc(-50% - 40px);
  .zone {
    height: 130px;
    display: flex;
    justify-content: space-between;
  }
}

.opponent-left-destiny,
.my-left-destiny {
  position: absolute;
  top: 288px;
  left: 175px;
}

.opponent-right-destiny,
.my-right-destiny {
  position: absolute;
  top: 288px;
  right: 175px;
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
  width: 930px;
  left: 50%;
  translate: -50% 0;
}

.opponent-battlefields {
  position: absolute;
  top: 160px;
  display: flex;
  padding-inline: 22px;
  justify-content: space-between;
  width: 100%;

  .zone {
    width: 438px;
    padding-inline: 10px;
    position: relative;
  }
}

.my-battlefields {
  position: absolute;
  top: 395px;
  display: flex;
  padding-inline: 22px;
  justify-content: space-between;
  width: 100%;

  .zone {
    width: 438px;
    padding-inline: 10px;
    position: relative;
  }
}

.my-base {
  position: absolute;
  width: 930px;
  left: 50%;
  translate: -50% 0;
  top: 536px;
}

.right-side {
  position: absolute;
  left: 1180px;
  top: 288px;
}

.my-hero {
  position: absolute;
  left: -150px;
  bottom: 250px;
}

.opponent-hero {
  position: absolute;
  left: -150px;
  top: 200px;
}

.effect-chain {
  flex-grow: 1;
  width: 100%;
  height: calc(var(--card-small-v2-height) / 2 + var(--size-4));
}

.opponent-left-score {
  top: 298px;
  left: 305px;
}

.my-left-score {
  top: 338px;
  left: 305px;
}

.opponent-right-score {
  top: 298px;
  right: 310px;
}

.my-right-score {
  top: 338px;
  right: 310px;
}

.victory-points {
  display: grid;
  grid-template-columns: repeat(v-bind('pointsToWin'), 47px);
  gap: 4px;
  align-items: center;
  justify-content: center;
}
.victory-point {
  width: 43px;
  height: 43px;
  background: url('@/assets/ui/score.png');
  &.empty {
    background: url('@/assets/ui/score-empty.png');
  }
}

.middle-side {
  position: absolute;
  top: 390px;
  left: 50%;
  translate: -50% -50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-2);
  width: 350px;
}

.resource-action-indicator {
  width: 40px;
  height: 40px;
  background: url('@/assets/ui/action-rune-colorless.png') no-repeat center
    center;
  background-size: contain;
  z-index: 1;
  filter: drop-shadow(0 0 10px var(--yellow-4));
  cursor: pointer;
  transition: filter 0.2s ease-in-out;
  &:disabled {
    filter: drop-shadow(0 0 10px var(--yellow-4)) brightness(0.5);
    cursor: not-allowed;
  }
  &:not(:disabled) {
    animation: resource-action-indicator-float 2s infinite ease-in-out;
    &:hover {
      filter: drop-shadow(0 0 15px var(--yellow-3)) brightness(1.2);
    }
  }
}

@keyframes resource-action-indicator-float {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -10px;
  }
}

.resource-actions-menu {
  position: absolute;
  bottom: calc(100% + var(--size-7));
  left: 50%;
  translate: -50% 0;
  display: flex;
  gap: var(--size-4);
  padding: var(--size-4);
  background-color: var(--color-bg-2);
  border-radius: var(--size-1);
  box-shadow: var(--shadow-2);
  background-color: hsl(0 0% 0% / 0.5);
  backdrop-filter: blur(4px);
}
.resource-action {
  width: 38px;
  height: 42px;
  background: transparent;
}

.might {
  background: url('@/assets/ui/action-rune-might.png') no-repeat center center;
}
.wisdom {
  background: url('@/assets/ui/action-rune-wisdom.png') no-repeat center center;
}
.focus {
  background: url('@/assets/ui/action-rune-focus.png') no-repeat center center;
}
.resonance {
  background: url('@/assets/ui/action-rune-resonance.png') no-repeat center
    center;
}
.draw {
  background: url('@/assets/ui/action-draw.png') no-repeat center center;
}
</style>
