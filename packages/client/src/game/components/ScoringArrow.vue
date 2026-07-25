<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import { waitFor } from '@game/shared';
import Arrow from './Arrow.vue';
import { throttle } from 'lodash-es';
import { useEventListener } from '@vueuse/core';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';

const { playerId } = useGameClient();
const ui = useGameUi();
const state = useGameState();

const scoringPath = ref('');

const VERTICAL_ALIGN_THRESHOLD = 50;

useFxEvent(FX_EVENTS.PRE_AFTER_SCORE, async event => {
  if (!state.value.config.SHOULD_CREATE_CHAIN_ON_SCORE) {
    state.value.scoring.scoringCard = event.card;
    state.value.scoring.scoredDestiny = event.destinyCard;
    buildScoringArrowPath();
    await waitFor(1000);
  }
});
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

  if (!state.value.scoring.scoringCard || !state.value.scoring.scoredDestiny) {
    scoringPath.value = '';
    return;
  }

  const path = buildArrowBetweenTwoCards(
    state.value.scoring.scoringCard,
    state.value.scoring.scoredDestiny,
    40,
    -80
  );
  console.log(path);
  scoringPath.value = path;
};

watchEffect(buildScoringArrowPath);
watch(() => playerId.value, buildScoringArrowPath);
watch(() => state.value.scoring, buildScoringArrowPath, { deep: true });
useEventListener(window, 'resize', throttle(buildScoringArrowPath, 100));
</script>

<template>
  <Teleport to="#arrows" defer>
    <Arrow :path="scoringPath" color="orange" v-if="scoringPath" />
  </Teleport>
</template>
