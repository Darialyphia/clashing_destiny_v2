<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import Arrow from './Arrow.vue';
import { throttle } from 'lodash-es';
import { useEventListener } from '@vueuse/core';

const { playerId } = useGameClient();
const ui = useGameUi();
const state = useGameState();

const scoringPath = ref('');

const VERTICAL_ALIGN_THRESHOLD = 50;

const buildArrowBetweenTwoCards = (
  card1: string,
  card2: string,
  biasY: number,
  biasX: number = 0
) => {
  const boardRect =
    ui.value.DOMSelectors.board.element!.getBoundingClientRect();
  const startRect = document
    .querySelector(ui.value.DOMSelectors.cardOnBoard(card1).selector)
    ?.getBoundingClientRect();
  const endRect = document
    .querySelector(ui.value.DOMSelectors.cardOnBoard(card2).selector)
    ?.getBoundingClientRect();
  if (!startRect || !endRect) return '';

  const start = {
    x: Math.round(startRect.left + startRect.width / 2 - boardRect.left),
    y: Math.round(startRect.top + startRect.height / 2 - boardRect.top)
  };
  const end = {
    x: Math.round(endRect.left + endRect.width / 2 - boardRect.left),
    y: Math.round(endRect.top + endRect.height / 2 - boardRect.top)
  };

  const highest = Math.min(start.y, end.y);
  const halfX = (start.x + end.x) / 2;
  let yDiff = Math.abs(start.y - end.y);
  if (yDiff === 0) {
    yDiff = biasY;
  }

  const xDiff = Math.abs(start.x - end.x);
  const controlX = xDiff < VERTICAL_ALIGN_THRESHOLD ? halfX + biasX : halfX;

  return `
        M${start.x},${start.y}
        Q${controlX},${highest - yDiff / 2}
         ${end.x},${end.y}
      `;
};

const buildScoringArrowPath = async () => {
  await nextTick();
  console.log(state.value.scoring);
  if (!state.value.scoring.scoringCard || !state.value.scoring.scoredDestiny) {
    scoringPath.value = '';
    return;
  }

  scoringPath.value = buildArrowBetweenTwoCards(
    state.value.scoring.scoringCard,
    state.value.scoring.scoredDestiny,
    40,
    -80
  );
};

watchEffect(buildScoringArrowPath);
watch(() => playerId.value, buildScoringArrowPath);
watch(() => state.value.scoring, buildScoringArrowPath);
useEventListener(window, 'resize', throttle(buildScoringArrowPath, 100));
</script>

<template>
  <Teleport to="#arrows" defer>
    <Arrow :path="scoringPath" color="orange" v-if="scoringPath" />
  </Teleport>
</template>
