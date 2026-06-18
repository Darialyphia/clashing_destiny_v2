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
import {
  EFFECT_TYPE,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { throttle } from 'lodash-es';
import { useEventListener } from '@vueuse/core';

const { playerId, client } = useGameClient();
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
    if (effect.type === EFFECT_TYPE.RETALIATION) {
      return [];
    }
    return effect.targets.cards.map(target => {
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
        x: startRect.left - boardRect.left + startRect.width / 2,
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
watch(() => playerId.value, buildPaths);
// watch(() => ui.value.explainerMessage, buildPaths);
useEventListener(window, 'resize', throttle(buildPaths, 100));

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

const isSelectable = (effectId: string) => {
  return (
    state.value.interaction.state ===
      INTERACTION_STATES.CHOOSING_CHAIN_EFFECT &&
    state.value.interaction.ctx.elligibleEffectsIds.includes(effectId)
  );
};
const onEffectClick = (effectId: string) => {
  if (isSelectable(effectId)) {
    client.value.chooseChainEffect(effectId);
  }
};
</script>

<template>
  <div
    class="effect-chain"
    id="effect-chain"
    :class="{ 'is-active': state.effectChain }"
  >
    <!-- <ExplainerMessage /> -->

    <p class="title dual-text" data-text="Effect Chain">Effect chain</p>
    <div class="flex items-center gap-4">
      <div class="effect-wrapper" v-for="(effect, index) in stack" :key="index">
        <InspectableCard :card-id="effect.source.id">
          <div
            class="effect"
            :class="[
              effect.playerType,
              { 'is-selectable': isSelectable(effect.id) }
            ]"
            @click="onEffectClick(effect.id)"
          >
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
              <p v-if="effect.type === EFFECT_TYPE.NEGATE">
                This effect will negate a previous effect on the chain.
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
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@property --effect-chain-glow-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes effect-chain-glow {
  from {
    --effect-chain-glow-angle: 0deg;
  }
  to {
    --effect-chain-glow-angle: 360deg;
  }
}
.effect-chain {
  --pixel-scale: 0.75;

  /* height: calc(var(--card-small-height)); */
  padding: var(--size-2) var(--size-4);
  background-color: hsl(0 0% 0% / 0.5);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-2);
  border: solid 3px transparent;
  transition: opacity 0.5s var(--ease-3);
  position: relative;
  z-index: 0;
  opacity: 0;
  --effect-chain-glow-angle: 0deg;
  &.is-active {
    border-image: conic-gradient(
      from var(--effect-chain-glow-angle) at center,
      cyan 0deg,
      orange 20deg,
      transparent 20deg
    );
    border-image-slice: 1;
    animation: effect-chain-glow 5s linear infinite;
    opacity: 1;
  }
}

.title {
  position: absolute;
  top: var(--size-2);
  right: var(--size-2);
  width: 20ch;
  text-align: right;
}

.ally {
  --shadow-color: cyan;
  filter: drop-shadow(0 0 1rem var(--shadow-color));
}
.enemy {
  --shadow-color: red;
  filter: drop-shadow(0 0 1rem var(--shadow-color));
}

.effect {
  position: relative;
  perspective: 2000px;
  transform-style: preserve-3d;
  transition: all 0.5s var(--ease-3);
  transition-delay: 0.5s;

  &.is-selectable::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: hsl(200 100% 50% / 0.25);
  }
  /* @starting-style {
    transform: scale(1.5) translateY(-15rem);
    animation: none;
  } */
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

  &:is(.retaliation, .declare-blocker) {
    background: url('@/assets/ui/effect-counterattack.png');
  }
}
</style>
