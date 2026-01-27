<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent, useGameState } from '../composables/useGameClient';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { waitFor } from '@game/shared';
import GameCard from './GameCard.vue';
import { CARD_SPEED } from '@game/engine/src/card/card.enums';
import { EFFECT_TYPE } from '@game/engine/src/game/game.enums';

const card = ref<CardViewModel | null>(null);
const state = useGameState();

useFxEvent(FX_EVENTS.CARD_BEFORE_PLAY, async event => {
  const playedCard = state.value.entities[event.card.id] as CardViewModel;
  if (playedCard.speed === CARD_SPEED.BURST) return;

  card.value = playedCard;

  await waitFor(1200);
  card.value = null;
});

useFxEvent(FX_EVENTS.EFFECT_CHAIN_BEFORE_EFFECT_RESOLVED, async event => {
  if (event.effect.source.type !== EFFECT_TYPE.CARD) return;
  const resolvedCard = state.value.entities[
    event.effect.source.id
  ] as CardViewModel;
  if (resolvedCard.speed === CARD_SPEED.BURST) return;

  card.value = resolvedCard;
  await waitFor(1200);
  card.value = null;
});

useFxEvent(FX_EVENTS.EFFECT_CHAIN_EFFECT_ADDED, async event => {
  if (event.effect.source.type !== EFFECT_TYPE.CARD) return;
  card.value = state.value.entities[event.effect.source.id] as CardViewModel;
  await waitFor(800);
  card.value = null;
});
</script>

<template>
  <teleport to="#card-portal">
    <div id="declared-played-card">
      <Transition>
        <div class="wrapper" v-if="card">
          <GameCard
            :card-id="card.id"
            :interactive="false"
            :auto-scale="false"
          />
        </div>
      </Transition>
    </div>
  </teleport>
</template>

<style scoped lang="postcss">
#declared-played-card {
  --pixel-scale: 2;
  position: fixed;
  top: var(--size-10);
  left: 50%;
  transform: translateX(-50%);
  width: calc(var(--pixel-scale) * var(--card-width));
  height: calc(var(--pixel-scale) * var(--card-height));
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

.wrapper {
  --pixel-scale: 1.5;
}
</style>
