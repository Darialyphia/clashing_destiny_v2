<script setup lang="ts">
import { useGameClient, useGameState } from '../composables/useGameClient';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import Arrow from './Arrow.vue';
import { at, throttle } from 'lodash-es';
import { useEventListener } from '@vueuse/core';

const client = useGameClient();
const state = useGameState();

const attackPath = ref('');
const blockerPath = ref('');

const buildArrowBetweenTwoCards = (card1: string, card2: string) => {
  const startRect = document
    .querySelector(client.value.ui.getCardDOMSelectorOnBoard(card1))!
    .getBoundingClientRect();
  const endRect = document
    .querySelector(client.value.ui.getCardDOMSelectorOnBoard(card2))!
    .getBoundingClientRect();

  const start = {
    x: startRect.left + startRect.width / 2,
    y: startRect.top + startRect.height / 2
  };
  const end = {
    x: endRect.left + endRect.width / 2,
    y: endRect.top + endRect.height / 2
  };

  return `M${start.x},${start.y} L${end.x},${end.y}`;
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
    state.value.phase.ctx.target
  );
};

watchEffect(buildAttackArrowPath);
watch(() => client.value.playerId, buildAttackArrowPath);
watch(() => state.value.phase.ctx, buildAttackArrowPath);
useEventListener(window, 'resize', throttle(buildAttackArrowPath, 100));

const buildBlockerArrowPath = async () => {
  await nextTick();
  if (state.value.phase.state !== GAME_PHASES.ATTACK) {
    blockerPath.value = '';
    return;
  }

  if (!state.value.phase.ctx.blocker) {
    blockerPath.value = '';
    return;
  }

  blockerPath.value = buildArrowBetweenTwoCards(
    state.value.phase.ctx.blocker,
    state.value.phase.ctx.attacker
  );
};

watchEffect(buildBlockerArrowPath);
watch(() => client.value.playerId, buildBlockerArrowPath);
watch(() => state.value.phase.ctx, buildBlockerArrowPath);
useEventListener(window, 'resize', throttle(buildBlockerArrowPath, 100));
</script>

<template>
  <Teleport to="#arrows" defer>
    <Arrow :path="attackPath" color="red" v-if="attackPath" />
    <Arrow :path="blockerPath" color="lime" v-if="blockerPath" />
  </Teleport>
</template>
