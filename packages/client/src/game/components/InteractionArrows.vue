<script setup lang="ts">
import { isDefined, waitFor } from '@game/shared';
import { useMouse } from '@vueuse/core';
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
import { waitForElement } from '@/utils/dom-utils';

const { client, playerId } = useGameClient();
const ui = useGameUi();
const state = useGameState();

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
  if (!('players' in ctx) || !ctx.players.includes(playerId.value)) return null;

  if ('source' in ctx && isDefined(ctx.source)) {
    return state.value.entities[ctx.source] as CardViewModel;
  }

  return null;
});

const pathColor = computed(() => {
  return 'cyan';
});

const computeParabolaPath = (
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  // Control point for quadratic bezier - creates a parabola arc
  // Place it above the midpoint to create an upward arc
  const midX = (start.x + end.x) / 2;
  const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
  const arcHeight = Math.min(distance * 0.4, 150); // Arc height proportional to distance
  const controlY = Math.min(start.y, end.y) - arcHeight;

  return `M ${start.x} ${start.y} Q ${midX} ${controlY} ${end.x} ${end.y}`;
};

const mousePath = ref('');
const selectedElementsPath = ref<string[]>([]);

watch(
  [() => state.value.interaction, playerId, x, y],
  () => {
    if (!isDefined(card.value)) {
      mousePath.value = '';
      return;
    }
    const cardEl = ui.value.DOMSelectors.interactionCard(card.value.id).element;
    if (!cardEl) {
      mousePath.value = '';
      return;
    }

    const rect = cardEl.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = x.value;
    const endY = y.value;

    mousePath.value = computeParabolaPath(
      { x: startX, y: startY },
      { x: endX, y: endY }
    );
  },
  { deep: true }
);

watch(
  () => state.value.interaction,
  async interaction => {
    if (!isDefined(card.value)) {
      selectedElementsPath.value = [];
      return;
    }
    let targets: HTMLElement[] = [];

    const cardEl = await waitForElement(
      ui.value.DOMSelectors.interactionCard(card.value!.id).selector,
      100
    );
    if (!cardEl) return;
    await waitFor(500);

    if (interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD) {
      targets = interaction.ctx.selectedCards
        .map(cardId => {
          return ui.value.DOMSelectors.cardOnBoard(cardId).element;
        })
        .filter(isDefined);
    } else if (
      interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD
    ) {
      targets = interaction.ctx.selectedSpaces
        .map(space => ui.value.DOMSelectors.boardSpace(space.id).element)
        .filter(isDefined);
    } else {
      selectedElementsPath.value = [];
      return;
    }

    const rect = cardEl.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    selectedElementsPath.value = targets.map(target => {
      const rect = target.getBoundingClientRect();
      const endX = rect.left + rect.width / 2;
      const endY = rect.top + rect.height / 2;
      return computeParabolaPath(
        { x: startX, y: startY },
        { x: endX, y: endY }
      );
    });
  }
);
</script>

<template>
  <Teleport to="#arrows" defer>
    <Arrow v-if="mousePath" :path="mousePath" :color="pathColor" />
    <Arrow
      v-for="(path, index) in selectedElementsPath"
      :key="index"
      :path="path"
      :color="pathColor"
    />
  </Teleport>
</template>

<style scoped lang="postcss"></style>
