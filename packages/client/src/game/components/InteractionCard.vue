<script setup lang="ts">
import GameCard from './GameCard.vue';
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import InspectableCard from '@/card/components/InspectableCard.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const { client } = useGameClient();
const state = useGameState();
const ui = useGameUi();

const interactionState = computed(() => state.value.interaction);
</script>

<template>
  <Transition appear>
    <div
      v-if="'source' in interactionState.ctx && !ui.selectedCard"
      class="interaction-card"
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
      <p v-if="interactionState.ctx.label">{{ interactionState.ctx.label }}</p>
      <FancyButton
        v-if="interactionState.ctx.canCancel"
        class="mt-4"
        text="Cancel"
        @click="client.cancelInteraction()"
      />
    </div>
  </Transition>
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
    transition: all 0.3s var(--ease-3);
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
</style>
