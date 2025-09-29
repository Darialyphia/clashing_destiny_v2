<script setup lang="ts">
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import Arrow from './Arrow.vue';
import { throttle } from 'lodash-es';
import { useEventListener } from '@vueuse/core';

const { playerId } = useGameClient();
const ui = useGameUi();
const state = useGameState();

const attackPath = ref('');
const counterAttackPath = ref('');

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
  if (state.value.phase.state !== GAME_PHASES.ATTACK) {
    attackPath.value = '';
    return;
  }

  if (!state.value.phase.ctx.target) {
    attackPath.value = '';
    return;
  }

  attackPath.value = buildArrowBetweenTwoCards(
    state.value.phase.ctx.attacker,
    state.value.phase.ctx.target,
    40
  );
};

watchEffect(buildAttackArrowPath);
watch(() => playerId.value, buildAttackArrowPath);
watch(() => state.value.phase.ctx, buildAttackArrowPath);
useEventListener(window, 'resize', throttle(buildAttackArrowPath, 100));

const buildCounterAttackArrowPath = async () => {
  await nextTick();
  if (state.value.phase.state !== GAME_PHASES.ATTACK) {
    counterAttackPath.value = '';
    return;
  }
  if (!state.value.phase.ctx.isTargetCounterattacking) {
    counterAttackPath.value = '';
    return;
  }

  counterAttackPath.value = buildArrowBetweenTwoCards(
    state.value.phase.ctx.target!,
    state.value.phase.ctx.attacker,
    -40
  );
};

watchEffect(buildCounterAttackArrowPath);
watch(() => playerId.value, buildCounterAttackArrowPath);
watch(() => state.value.phase.ctx, buildCounterAttackArrowPath);
useEventListener(window, 'resize', throttle(buildCounterAttackArrowPath, 100));
</script>

<template>
  <Teleport to="#arrows" defer>
    <Arrow :path="attackPath" color="red" v-if="attackPath" />
    <Arrow :path="counterAttackPath" color="lime" v-if="counterAttackPath" />
  </Teleport>
</template>
