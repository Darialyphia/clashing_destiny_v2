<script setup lang="ts">
import { isDefined, useMouse } from '@vueuse/core';
import {
  INTERACTION_STATES,
  type InteractionState
} from '@game/engine/src/game/game.enums';
import {
  useGameClient,
  useGameUi,
  useGameState
} from '../composables/useGameClient';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import Arrow from './Arrow.vue';

const { client, playerId } = useGameClient();
const ui = useGameUi();
const state = useGameState();
const path = ref('');

const { x, y } = useMouse();

const validInteractionStates: InteractionState[] = [
  INTERACTION_STATES.SELECTING_CARDS_ON_BOARD,
  INTERACTION_STATES.SELECTING_SPACE_ON_BOARD
];

const card = computed(() => {
  if (client.value.isPlayingFx) return null;

  const interaction = state.value.interaction;
  if (!validInteractionStates.includes(interaction.state)) return null;

  const ctx = interaction.ctx;
  if (ctx.player !== playerId.value) return null;

  if ('source' in ctx && isDefined(ctx.source)) {
    return state.value.entities[ctx.source] as CardViewModel;
  }

  return null;
});

const pathColor = computed(() => {
  return 'cyan';
});

const shouldBeDisplayed = computed(() => isDefined(card.value));

const computeParabolaPath = () => {
  if (!shouldBeDisplayed.value) return '';
  if (!isDefined(card.value)) return '';
  const cardEl = ui.value.DOMSelectors.cardOnBoard(card.value.id).element;
  if (!cardEl) return '';

  const rect = cardEl.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  const endX = x.value;
  const endY = y.value;

  // Control point for quadratic bezier - creates a parabola arc
  // Place it above the midpoint to create an upward arc
  const midX = (startX + endX) / 2;
  const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
  const arcHeight = Math.min(distance * 0.4, 150); // Arc height proportional to distance
  const controlY = Math.min(startY, endY) - arcHeight;

  return `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;
};

watch(
  [() => state.value.interaction, playerId, x, y],
  () => {
    path.value = computeParabolaPath();
  },
  { deep: true }
);
</script>

<template>
  <Teleport to="#arrows" defer>
    <Arrow v-if="path" :path="path" :color="pathColor" />
  </Teleport>
</template>

<style scoped lang="postcss"></style>
