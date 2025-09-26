<script setup lang="ts">
import InspectableCard from '@/card/components/InspectableCard.vue';
import {
  useGameClient,
  useGameState,
  useMyPlayer
} from '../composables/useGameClient';
import Arrow from './Arrow.vue';
import { match } from 'ts-pattern';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import GameCard from './GameCard.vue';

const client = useGameClient();
const state = useGameState();

const paths = ref<string[][]>([]);

const buildPaths = async () => {
  if (!state.value.effectChain?.stack) {
    paths.value = [];
    return;
  }
  await nextTick();
  paths.value = state.value.effectChain?.stack.map(effect => {
    return effect.targets.map(target => {
      const startRect = document
        .querySelector(
          client.value.ui.getCardDOMSelectorInEffectChain(effect.source)
        )!
        .getBoundingClientRect();
      const endRect = match(target)
        .with({ type: 'card' }, target => {
          return document
            .querySelector(
              client.value.ui.getCardDOMSelectorOnBoard(target.card)
            )
            ?.getBoundingClientRect();
        })
        .with({ type: 'minionPosition' }, target => {
          return client.value.ui.DOMSelectors.minionSprite(
            target.playerId,
            target.zone,
            target.slot
          ).element?.getBoundingClientRect();
        })
        .exhaustive();
      if (!startRect || !endRect) return '';

      const start = {
        x: startRect.left + startRect.width / 2,
        y: startRect.top + startRect.height / 2
      };
      const end = {
        x: endRect.left + endRect.width / 2,
        y: endRect.top + endRect.height / 2
      };
      const highest = Math.min(start.y, end.y);
      const halfX = (start.x + end.x) / 2;
      const yDiff = Math.abs(start.y - end.y);
      return `
        M${start.x},${start.y}
        Q${halfX},${highest - yDiff / 2}
         ${end.x},${end.y}
      `;
    });
  });
};
watch(() => state.value.effectChain?.stack, buildPaths);
watch(() => client.value.playerId, buildPaths);

const myPlayer = useMyPlayer();
const stack = computed(() => {
  return (
    state.value.effectChain?.stack.map(step => {
      const card = state.value.entities[step.source] as CardViewModel;
      return {
        ...step,
        type: card?.player.equals(myPlayer.value) ? 'ally' : 'enemy',
        image: `url(${card?.imagePath})`
      };
    }) ?? []
  );
});
</script>

<template>
  <div class="effect-chain" id="effect-chain" v-show="stack.length > 0">
    <InspectableCard
      v-for="(effect, index) in stack"
      :key="index"
      :card-id="effect.source"
      class="effect-chain-card-wrapper"
    >
      <div class="effect" :class="effect.type">
        <GameCard
          :card-id="effect.source"
          :is-interactive="false"
          variant="small"
        />
      </div>

      <Teleport to="#arrows">
        <Arrow
          v-for="(path, targetIndex) in paths[index]"
          :key="targetIndex"
          :path="path"
          :color="effect.type === 'ally' ? 'cyan' : 'red'"
        />
      </Teleport>
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.effect-chain {
  flex-grow: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-1);
  border: solid 1px #985e25;
}

@keyframes chain-effect-pulse {
  to {
    box-shadow: 0 0 1rem var(--shadow-color);
  }
}
.ally {
  --shadow-color: cyan;
  animation: chain-effect-pulse 2.5s infinite alternate;
}
.enemy {
  --shadow-color: red;
  animation: chain-effect-pulse 2.5s infinite alternate;
}
</style>
