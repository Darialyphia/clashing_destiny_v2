<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent, useGameState } from '../composables/useGameClient';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { waitFor } from '@game/shared';
import GameCard from './GameCard.vue';
import CardResizer from './CardResizer.vue';

const card = ref<CardViewModel | null>(null);
const state = useGameState();

useFxEvent(FX_EVENTS.CARD_DECLARE_PLAY, async event => {
  card.value = state.value.entities[event.card.id] as CardViewModel;
  await waitFor(1200);
  card.value = null;
});
</script>

<template>
  <teleport to="#card-portal">
    <div id="declared-played-card">
      <Transition>
        <div class="wrapper" v-if="card">
          <CardResizer :card-id="card.id" :forced-scale="0.5">
            <GameCard
              :card-id="card.id"
              :interactive="false"
              :auto-scale="false"
            />
          </CardResizer>
        </div>
      </Transition>
    </div>
  </teleport>
</template>

<style scoped lang="postcss">
#declared-played-card {
  position: fixed;
  top: var(--size-5);
  left: 50%;
  transform: translateX(-50%);
  width: var(--card-width);
  height: var(--card-height);
  pointer-events: none;
}

:is(.v-enter-active, .v-leave-active) {
  transition:
    opacity 0.5s var(--ease-2),
    transform 0.5s var(--ease-2);
}

:is(.v-enter-from, .v-leave-to) {
  opacity: 0;
}

.v-enter-from {
  transform: translateY(-30px) rotateY(180deg);
}

.v-leave-to {
  transform: translateY(-30px);
}
</style>
