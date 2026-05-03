<script setup lang="ts">
import { useFxEvent, useGameUi } from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { waitFor } from '@game/shared';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { until } from '@vueuse/core';
import ModifiersList from './ModifiersList.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import AbilityMenu from './AbilityMenu.vue';

const { card, isShaking = false } = defineProps<{
  card: CardViewModel;
  isShaking?: boolean;
}>();

const ui = useGameUi();

const element = ref<HTMLElement>();
onMounted(() => {
  element.value = ui.value.DOMSelectors.cardOnBoard(card.id).element!;
});

const isBeingDropped = ref(false);
const dropScale = ref(1);
const dropDuration = ref('');

const unitEl = useTemplateRef('unit');

const isAttacking = ref(false);

useFxEvent(FX_EVENTS.CARD_BEFORE_DEAL_COMBAT_DAMAGE, async event => {
  if (event.card !== card.id) return;

  if (!unitEl.value) return;
  isAttacking.value = true;
  unitEl.value.addEventListener(
    'animationend',
    () => {
      isAttacking.value = false;
    },
    { once: true }
  );
  await until(isAttacking).toBe(false);
});

const isTakingDamage = ref(false);
useFxEvent(FX_EVENTS.CARD_BEFORE_TAKE_DAMAGE, async event => {
  if (event.card !== card.id) return;

  if (!unitEl.value) return;
  isTakingDamage.value = true;
  unitEl.value.addEventListener(
    'animationend',
    () => {
      isTakingDamage.value = false;
    },
    { once: true }
  );

  await until(isTakingDamage).toBe(false);
  await waitFor(200);
});

const hasAvailableAbilities = computed(() => {
  return card.abilityActions.some(ability => {
    return ability.predicate();
  });
});

const modifiers = computed(() => card.modifiers);
</script>

<template>
  <div
    ref="unit"
    :id="ui.DOMSelectors.cardOnBoard(card.id).id"
    class="unit"
    :class="[
      {
        'is-exhausted': card.isExhausted,
        'is-selected': ui.selectedCard?.equals(card),
        'is-being-dropped': isBeingDropped,
        'is-attacking': isAttacking,
        'is-taking-damage': isTakingDamage,
        'has-ability': hasAvailableAbilities,
        'is-shaking': isShaking
      }
    ]"
  >
    <GameCard
      variant="small"
      :card-id="card.id"
      show-stats
      :overrides="{ atk: card.atk, hp: card.hp }"
    />
    <ModifiersList :modifiers="modifiers" />
    <AbilityMenu :card="card" actions-side="top" use-portal class="abilities" />
  </div>
</template>

<style scoped lang="postcss">
.unit {
  --pixel-scale: 2;
  width: 100%;
  height: 100%;
  transition: all 0.3s var(--ease-2);
  position: relative;
  transform-style: preserve-3d;

  &.is-selected {
    translate: 0 -6px;
    box-shadow: 0 6px 30px 4px black;
  }

  &.is-exhausted:not(.is-being-dropped) {
    filter: grayscale(35%) brightness(50%);
  }

  &.is-being-dropped {
    animation: drop v-bind(dropDuration) ease-in forwards;
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
  bottom: 7px;
}
@keyframes drop {
  0% {
    scale: v-bind(dropScale);
    translate: 0 -200px;
    opacity: 0;
    filter: brightness(700%);
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
