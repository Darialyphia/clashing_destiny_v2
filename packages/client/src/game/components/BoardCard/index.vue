<script setup lang="ts">
import { useGameClient, useGameUi } from '../../composables/useGameClient';
import GameCard from '../GameCard.vue';
import ModifiersList from '../ModifiersList.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import AbilityMenu from '../AbilityMenu.vue';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useBoardCardAnimationSequence } from './useBoardCardAnimationSequence';
import { useBoardCardFxEvents } from './useBoardCardFx';
import { useBoardCardInteraction } from './useBoardCardInteraction';

const {
  card,
  isShaking = false,
  variant = 'small',
  pixelScale
} = defineProps<{
  card: CardViewModel;
  isShaking?: boolean;
  variant?: 'default' | 'small';
  pixelScale?: number;
}>();

const ui = useGameUi();
const { playerId } = useGameClient();
const element = ref<HTMLElement>();

const {
  animationSequence,
  resetAnimationSequence,
  addOnAnimationSequenceEndCallback,
  onAnimationSequenceEnd,
  playSelectedAnimationSequence,
  playAttackAnimationSequence,
  playHitSequence,
  shouldRepeat,
  playDeathAnimationSequence
} = useBoardCardAnimationSequence(card);

const {
  isSelected,
  hasAvailableAbilities,
  isTargetable,
  canAttack,
  onMouseup
} = useBoardCardInteraction(card);

watch(isSelected, selected => {
  if (!selected) {
    resetAnimationSequence();
  } else {
    playSelectedAnimationSequence();
  }
});

onMounted(() => {
  element.value = ui.value.DOMSelectors.cardOnBoard(card.id).element!;
});

const unitEl = useTemplateRef('unit');

const { isBeingPlayed, DROP_DURATION, isAttacking, isTakingDamage } =
  useBoardCardFxEvents(card, unitEl, {
    onAttack: playAttackAnimationSequence,
    onDestroy: playDeathAnimationSequence,
    onHit: playHitSequence,
    onSequenceEnd: addOnAnimationSequenceEndCallback
  });

const shouldScaleSprite = computed(() => {
  return card.kind !== CARD_KINDS.DESTINY;
});

const isHovered = ref(false);
</script>

<template>
  <div
    ref="unit"
    :id="ui.DOMSelectors.cardOnBoard(card.id).id"
    class="board-card"
    :class="[
      {
        'is-ally': card.player.id === playerId,
        'is-enemy': card.player.id !== playerId,
        'is-exhausted': card.isExhausted,
        'is-selected': ui.selectedCard?.equals(card),
        'is-being-played': isBeingPlayed,
        'is-attacking': isAttacking,
        'is-taking-damage': isTakingDamage,
        'has-ability': hasAvailableAbilities,
        'is-shaking': isShaking,
        'is-targetable': isTargetable,
        'is-attackable': canAttack
      }
    ]"
    :style="{
      '--drop-duration': `${DROP_DURATION}ms`
    }"
    @mouseup="onMouseup"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <ModifiersList :card="card" class="modifiers" />

    <InspectableCard :card-id="card.id" side="right" :side-offset="20">
      <GameCard
        :variant
        :card-id="card.id"
        show-stats
        :pixel-scale="pixelScale"
        :overrides="{
          atk: card.atk,
          hp: card.hp,
          commandment: card.commandment
        }"
        :animation-sequence="animationSequence"
        :sprite-scale="shouldScaleSprite ? 1.5 : 1"
        :repeat-animation="shouldRepeat"
        @art-sequence-end="onAnimationSequenceEnd"
      />
    </InspectableCard>
    <Transition>
      <AbilityMenu
        v-if="isHovered"
        :card="card"
        use-portal
        class="abilities"
        :class="variant"
        :actions-side="variant === 'small' ? 'bottom' : 'top'"
      />
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
.board-card {
  --pixel-scale: 1;
  /* width: var(--card-small-v2-width);
  height: var(--card-small-v2-height); */
  transition: all 0.3s var(--ease-2);
  position: relative;
  transform-style: preserve-3d;

  &.is-selected {
    translate: 0 -6px;
    box-shadow: 0 6px 30px 4px black;
  }

  &.is-exhausted:not(.is-being-played) {
    rotate: 5deg;
    filter: grayscale(70%) brightness(80%);
  }

  &.is-being-played {
    filter: brightness(140%);
    animation: drop var(--drop-duration) cubic-bezier(0.18, 0.88, 0.32, 1.08)
      forwards;
  }

  &.is-targetable {
    --shadow-color: var(--orange-4);
    filter: drop-shadow(0 0 6px var(--shadow-color));
    translate: 0 -8px;
    box-shadow: 0 0px 20px 0 var(--shadow-color);

    &:hover {
      --shadow-color: var(--yellow-2);
    }
  }

  &.is-attackable {
    --shadow-color: var(--red-5);
    filter: drop-shadow(0 0 6px var(--shadow-color));
    translate: 0 -8px;
    box-shadow: 0 0px 20px 0 var(--shadow-color);

    &:hover {
      --shadow-color: var(--red-4);
    }
  }

  &.is-attacking {
    animation: unit-attack 0.2s linear;
  }

  &.is-taking-damage {
    animation:
      unit-take-damage 0.3s ease-in-out,
      unit-take-damage-shake 0.3s linear;
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: red;
      opacity: 0.8;
      mix-blend-mode: multiply;
      pointer-events: none;
    }
  }

  &.is-shaking {
    animation: var(--animation-shake-x);
    animation-duration: 0.3s;
  }

  &.has-ability {
    filter: drop-shadow(0 0 8px var(--yellow-3));
  }
}

.abilities {
  position: absolute;
  left: 50%;
  translate: -50% 0;
  transform: translateZ(2px);
  &.default {
    top: 7px;
  }
  &.small {
    bottom: -23px;
  }
  &.v-enter-active,
  &.-leave-active {
    transition: all 0.2s var(--ease-2);
  }
  &.v-enter-from,
  &.-leave-to {
    opacity: 0.5;
    transform: translateZ(2px) translateY(-5px);
  }
}

.modifiers {
  position: absolute;
  .is-enemy & {
    top: calc(-28px * var(--pixel-scale));
  }
  .is-ally & {
    bottom: calc(-28px * var(--pixel-scale));
  }
  transform: translateZ(0px);
  /* translate: 0 5px; */
  /* opacity: 0; */
  transition:
    opacity 0.2s var(--ease-2),
    translate 0.2s var(--ease-2);
  .board-card:hover & {
    transform: translateZ(2px);
    opacity: 1;
    translate: 0 0;
  }
}

.retaliate-button {
  position: absolute;
  top: -25%;
  left: 50%;
  translate: -50% -50%;
  width: calc(24px * var(--pixel-scale));
  height: calc(19px * var(--pixel-scale));
  border: none;
  cursor: pointer;
  background: url('@/assets/ui/retaliate.png') no-repeat center center;
  background-size: cover;
  transform: translateZ(2px);
  transition: filter 0.3s var(--ease-2);
  &:hover {
    filter: brightness(1.2) drop-shadow(0 0 6px var(--yellow-3));
  }
}
@keyframes drop {
  0% {
    scale: 2;
    translate: 0 -180px;
    opacity: 0;
  }
}

@keyframes unit-attack {
  to {
    transform: rotateY(360deg);
  }
}

@keyframes unit-take-damage {
  50% {
    filter: sepia(100%) hue-rotate(-40deg) brightness(75%) saturate(180%)
      drop-shadow(0 0 10px red);
  }
}

@keyframes unit-take-damage-shake {
  0%,
  100% {
    transform: none;
  }
  20%,
  60% {
    transform: translateX(-5px);
  }
  40%,
  80% {
    transform: translateX(5px);
  }
}
</style>
