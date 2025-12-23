<script setup lang="ts">
import InspectableCard from '@/card/components/InspectableCard.vue';
import {
  useGameClient,
  useGameState,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import Arrow from './Arrow.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import GameCard from './GameCard.vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { EFFECT_TYPE } from '@game/engine/src/game/game.enums';
import ExplainerMessage from './ExplainerMessage.vue';

const { playerId } = useGameClient();
const ui = useGameUi();
const state = useGameState();

const paths = ref<string[][]>([]);

const buildPaths = async () => {
  if (!state.value.effectChain?.stack) {
    paths.value = [];
    return;
  }
  await nextTick();
  paths.value = state.value.effectChain?.stack.map(effect => {
    if (effect.type === EFFECT_TYPE.DECLARE_BLOCKER) {
      return [];
    }
    if (effect.zone) {
      const boardRect =
        ui.value.DOMSelectors.board.element!.getBoundingClientRect();
      const startRect = ui.value.DOMSelectors.cardInEffectChain(
        effect.source.id
      ).element!.getBoundingClientRect();
      const endRect = ui.value.DOMSelectors.zone(
        effect.zone?.player,
        effect.zone?.zone
      ).element?.getBoundingClientRect();
      if (!startRect || !endRect) return [];
      const start = {
        x: startRect.left + startRect.width / 2 - boardRect.left,
        y: startRect.top + startRect.height / 2 - boardRect.top
      };
      const end = {
        x: endRect.left + endRect.width / 2 - boardRect.left,
        y: endRect.top + endRect.height / 2 - boardRect.top
      };
      const highest = Math.min(start.y, end.y);
      const halfX = (start.x + end.x) / 2;
      const yDiff = Math.abs(start.y - end.y);
      return [
        `
        M${start.x},${start.y}
        Q${halfX},${highest - yDiff / 2}
         ${end.x},${end.y}
      `
      ];
    }
    return effect.targets.map(target => {
      const boardRect =
        ui.value.DOMSelectors.board.element!.getBoundingClientRect();

      const startRect = ui.value.DOMSelectors.cardInEffectChain(
        effect.source.id
      ).element!.getBoundingClientRect();

      const endRect =
        ui.value.DOMSelectors.cardOnBoard(
          target
        ).element?.getBoundingClientRect();

      if (!startRect || !endRect) return '';

      const start = {
        x: startRect.left + startRect.width / 2 - boardRect.left,
        y: startRect.top + startRect.height / 2 - boardRect.top
      };
      const end = {
        x: endRect.left + endRect.width / 2 - boardRect.left,
        y: endRect.top + endRect.height / 2 - boardRect.top
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
watch(() => state.value.effectChain?.stack, buildPaths, { immediate: true });
watch(() => playerId.value, buildPaths, { immediate: true });

const myPlayer = useMyPlayer();
const stack = computed(() => {
  return (
    state.value.effectChain?.stack.map(step => {
      const card = state.value.entities[step.source.id] as CardViewModel;
      return {
        ...step,
        playerType: card?.player.equals(myPlayer.value) ? 'ally' : 'enemy',
        image: `url(${card?.art.main})`
      };
    }) ?? []
  );
});
</script>

<template>
  <div class="effect-chain" id="effect-chain">
    <InspectableCard
      v-for="(effect, index) in stack"
      :key="index"
      :card-id="effect.source.id"
    >
      <div class="effect" :class="effect.playerType">
        <GameCard
          :card-id="effect.source.id"
          :is-interactive="false"
          variant="small"
        />

        <UiSimpleTooltip>
          <template #trigger>
            <div class="effect-type" :class="effect.type.toLowerCase()" />
          </template>
          <p v-if="effect.type === EFFECT_TYPE.ABILITY">
            This effect with execute an ability
          </p>
          <p v-if="effect.type === EFFECT_TYPE.CARD">
            This effect will play a card.
          </p>
          <p v-if="effect.type === EFFECT_TYPE.DECLARE_BLOCKER">
            This effect declares a blocker
          </p>
        </UiSimpleTooltip>
      </div>

      <Teleport to="#arrows" defer>
        <Arrow
          v-for="(path, targetIndex) in paths[index]"
          :key="targetIndex"
          :path="path"
          :color="effect.playerType === 'ally' ? 'cyan' : 'red'"
        />
      </Teleport>
    </InspectableCard>
    <ExplainerMessage class="ml-auto" />
  </div>
</template>

<style scoped lang="postcss">
.effect-chain {
  flex-grow: 1;
  align-self: stretch;
  display: flex;
  align-items: center;
  gap: var(--size-3);
  --pixel-scale: 0.75;
  height: calc(var(--card-small-height) * var(--pixel-scale));
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
  perspective: 2000px;
  transform-style: preserve-3d;
  transition: all 0.5s var(--ease-3);
  transition-delay: 1s;
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
  transform: translateZ(1px);

  &.card {
    background: url('@/assets/ui/effect-card.png');
  }

  &.ability {
    background: url('@/assets/ui/effect-ability.png');
  }

  &.counterattack {
    background: url('@/assets/ui/effect-counterattack.png');
  }
}
</style>
