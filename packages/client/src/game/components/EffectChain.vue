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
          client.value.ui.DOMSelectors.cardInEffectChain(effect.source).selector
        )!
        .getBoundingClientRect();
      const endRect = match(target)
        .with({ type: 'card' }, target => {
          return document
            .querySelector(
              client.value.ui.DOMSelectors.cardOnBoard(target.card).selector
            )
            ?.getBoundingClientRect();
        })
        .with({ type: 'minionPosition' }, target => {
          return client.value.ui.DOMSelectors.minionPosition(
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
        playerType: card?.player.equals(myPlayer.value) ? 'ally' : 'enemy',
        image: `url(${card?.imagePath})`
      };
    }) ?? []
  );
});
</script>

<template>
  <div>
    <div class="effect-chain" id="effect-chain">
      <InspectableCard
        v-for="(effect, index) in stack"
        :key="index"
        :card-id="effect.source"
        class="effect-chain-card-wrapper"
      >
        <div class="effect" :class="effect.playerType">
          <GameCard
            :card-id="effect.source"
            :is-interactive="false"
            variant="small"
          />

          <div class="effect-type" :class="effect.type.toLowerCase()" />
        </div>

        <Teleport to="#arrows">
          <Arrow
            v-for="(path, targetIndex) in paths[index]"
            :key="targetIndex"
            :path="path"
            :color="effect.playerType === 'ally' ? 'cyan' : 'red'"
          />
        </Teleport>
      </InspectableCard>
    </div>
    <div class="text-center">Card chain</div>
  </div>
</template>

<style scoped lang="postcss">
.effect-chain {
  flex-grow: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: var(--size-3);
  height: calc(var(--card-small-height) + var(--size-1) * 2);
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

.effect {
  position: relative;
}

.effect-type {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 32px;
  aspect-ratio: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  &.card {
    background: url('/assets/ui/effect-card.png');
  }

  &.ability {
    background: url('/assets/ui/effect-ability.png');
  }

  &.counterattack {
    background: url('/assets/ui/effect-counterattack.png');
  }
}
</style>
