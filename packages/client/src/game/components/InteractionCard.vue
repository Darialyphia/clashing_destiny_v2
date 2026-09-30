<script setup lang="ts">
import GameCard from './GameCard.vue';
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import InspectableCard from '@/card/components/InspectableCard.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums.js';
import { useMouse } from '@vueuse/core';
import { waitFor } from '@game/shared';

const { client } = useGameClient();
const state = useGameState();
const ui = useGameUi();

const interactionState = computed(() => state.value.interaction);

const isDisplayed = computed(() => {
  if (ui.value.selectedCard) {
    return false;
  }
  return (
    interactionState.value.state ===
      INTERACTION_STATES.SELECTING_CARDS_ON_BOARD ||
    interactionState.value.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD
  );
});

const source = computed(() => {
  if ('source' in interactionState.value.ctx) {
    return interactionState.value.ctx.source;
  }
  return null;
});
const offset = ref({
  x: 0,
  y: 0
});

const { x, y } = useMouse();
const root = useTemplateRef('root');
watch([source, isDisplayed], async ([newSource, newIsDisplayed]) => {
  if (!newSource || !newIsDisplayed) return;

  await nextTick();
  const targetRect = root.value!.getBoundingClientRect();
  const innerEl = root.value!.firstChild as HTMLElement;
  innerEl.style.transition = 'none';
  innerEl.style.pointerEvents = 'none';
  offset.value.x = x.value - targetRect.left;
  offset.value.y = y.value - targetRect.top;
  await waitFor(100);
  offset.value = {
    x: 0,
    y: 0
  };
  innerEl.style.transition = '';
  innerEl.style.pointerEvents = '';
});
</script>

<template>
  <div
    v-if="'source' in interactionState.ctx && isDisplayed"
    ref="root"
    class="interaction-card"
  >
    <div
      class="inner"
      :style="{
        transform: `translate(${offset.x}px, ${offset.y}px)`
      }"
    >
      <InspectableCard
        :card-id="interactionState.ctx.source"
        :is-interactive="false"
      >
        <GameCard
          :card-id="interactionState.ctx.source"
          :is-interactive="false"
          :pixel-scale="1.5"
        />
      </InspectableCard>
    </div>
    <p v-if="interactionState.ctx.label">{{ interactionState.ctx.label }}</p>
    <FancyButton
      v-if="interactionState.ctx.canCancel"
      class="mt-4"
      text="Cancel"
      @click="client.cancelInteraction()"
    />
  </div>
</template>

<style scoped lang="postcss">
.interaction-card {
  position: absolute;
  left: var(--size-10);
  bottom: 15%;
  translate: 0 -50%;
  z-index: 2;

  &.v-enter-active,
  &.v-leave-active {
    transition: all 0.6s var(--ease-3);
  }

  &.v-enter-from,
  &.v-leave-to {
    translate: var(--size-8) 0;
    opacity: 0;
  }
}
p {
  margin-top: var(--size-4);
  font-size: var(--size-4);
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
  text-align: center;
}

.inner {
  will-change: transform;
  transition: transform 0.5s var(--ease-3);
}
</style>
