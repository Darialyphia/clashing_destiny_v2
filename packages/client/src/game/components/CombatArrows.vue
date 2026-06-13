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

const attackPath = ref('');

const buildArrowBetweenTwoCards = (
  card1: string,
  card2: string,
  biasY: number
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
  return `
        M${start.x},${start.y}
        Q${halfX},${highest - yDiff / 2}
         ${end.x},${end.y}
      `;
};

const buildAttackArrowPath = async () => {
  await nextTick();
  if (!state.value.combat.attacker) {
    attackPath.value = '';
    return;
  }

  if (!state.value.combat.defender) {
    attackPath.value = '';
    return;
  }

  attackPath.value = buildArrowBetweenTwoCards(
    state.value.combat.attacker,
    state.value.combat.defender,
    40
  );
};

watchEffect(buildAttackArrowPath);
watch(() => playerId.value, buildAttackArrowPath);
watch(() => state.value.phase.ctx, buildAttackArrowPath);
useEventListener(window, 'resize', throttle(buildAttackArrowPath, 100));
</script>

<template>
  <Teleport to="#arrows" defer>
    <Arrow :path="attackPath" color="red" v-if="attackPath" />
  </Teleport>
</template>
