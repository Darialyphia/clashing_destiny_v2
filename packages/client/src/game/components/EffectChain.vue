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
import { isDefined } from '@game/shared';

const { playerId, client } = useGameClient();
const ui = useGameUi();
const state = useGameState();

const paths = ref<string[][]>([]);

const getPath = (
  startRect: DOMRect,
  endRect: DOMRect,
  boardRect: DOMRect,
  offset: { x: number; y: number } = { x: 0, y: 0 }
) => {
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
  const controlX = halfX + offset.x;
  const controlY = highest - yDiff / 2 + offset.y;
  return `
        M${start.x},${start.y}
        Q${controlX},${controlY}
         ${end.x},${end.y}
      `;
};
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
    if (effect.shouldHideTargetArrows) {
      return [];
    }
    const cardArrows = effect.targets.cards.map(target => {
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

      return getPath(startRect, endRect, boardRect);
    });

    const spaceArrows = effect.targets.spaces.map(target => {
      const boardRect =
        ui.value.DOMSelectors.board.element!.getBoundingClientRect();

      const startRect = ui.value.DOMSelectors.cardInEffectChain(
        effect.source.id
      ).element!.getBoundingClientRect();

      const endRect =
        ui.value.DOMSelectors.boardSpace(
          target
        ).element?.getBoundingClientRect();

      if (!startRect || !endRect) return '';
      return getPath(startRect, endRect, boardRect);
    });

    const effectArrow = effect.targets.effect
      ? (() => {
          const boardRect =
            ui.value.DOMSelectors.board.element!.getBoundingClientRect();

          const startRect = ui.value.DOMSelectors.cardInEffectChain(
            effect.source.id
          ).element!.getBoundingClientRect();

          const cardOnEffect = state.value.effectChain?.stack.find(
            e => e.id === effect.targets.effect
          )?.source;

          if (!cardOnEffect) return null;
          const endRect = ui.value.DOMSelectors.cardInEffectChain(
            cardOnEffect.id
          ).element?.getBoundingClientRect();

          if (!startRect || !endRect) return '';
          return getPath(startRect, endRect, boardRect, { x: 0, y: -40 });
        })()
      : null;

    return [...cardArrows, ...spaceArrows, effectArrow].filter(isDefined);
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
    class="effect-chain surface"
    id="effect-chain"
    :class="{ 'is-active': state.effectChain }"
  >
    <!-- <ExplainerMessage /> -->

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
            :pixel-scale="0.5"
          />

          <UiSimpleTooltip>
            <template #trigger>
              <div class="effect-type" :class="effect.type.toLowerCase()" />
            </template>
            <p v-if="effect.type === EFFECT_TYPE.ABILITY">
              This effect will execute an ability.
            </p>
            <p v-if="effect.type === EFFECT_TYPE.CARD">
              This effect will play a card.
            </p>
            <p v-if="effect.type === EFFECT_TYPE.RETALIATION">
              This effect declaresa retaliation.
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
  --pixel-scale: 0.5;

  /* height: calc(var(--card-small-height)); */
  border-radius: var(--radius-2);
  /* border: solid 3px transparent; */
  transition: opacity 0.5s var(--ease-3);
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  gap: var(--size-4);
  --effect-chain-glow-angle: 0deg;
  visibility: hidden;
  &.is-active {
    visibility: visible;
    /* border-image: conic-gradient(
      from var(--effect-chain-glow-angle) at center,
      cyan 0deg,
      orange 20deg,
      transparent 20deg
    ); */
    /* border-image-slice: 1; */
    animation: effect-chain-glow 5s linear infinite;
    opacity: 1;
  }
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
