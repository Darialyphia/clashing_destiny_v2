<script setup lang="ts">
import {
  useFxEvent,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { isDefined, waitFor } from '@game/shared';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { until } from '@vueuse/core';
import ModifiersList from './ModifiersList.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import AbilityMenu from './AbilityMenu.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';

const { card, isShaking = false } = defineProps<{
  card: CardViewModel;
  isShaking?: boolean;
}>();

const ui = useGameUi();

const element = ref<HTMLElement>();
onMounted(() => {
  element.value = ui.value.DOMSelectors.cardOnBoard(card.id).element!;
});

const isBeingPlayed = ref(false);
const DROP_DURATION = 300;
useFxEvent(FX_EVENTS.CARD_AFTER_PLAY, async event => {
  if (event.card.id !== card.id) return;
  isBeingPlayed.value = true;
  await waitFor(DROP_DURATION);
  isBeingPlayed.value = false;
});

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

const modifiers = computed(() => card.modifiers.filter(isDefined));

const state = useGameState();
const isTargetable = computed(() => {
  if (
    state.value.interaction.state !==
    INTERACTION_STATES.SELECTING_CARDS_ON_BOARD
  )
    return false;
  return state.value.interaction.ctx.elligibleCards.some(
    cardId => cardId === card.id
  );
});

const canAttack = computed(() => {
  if (!ui.value.selectedCard) return false;

  return ui.value.selectedCard.canAttackAt(card);
});

const onMouseup = (e: MouseEvent) => {
  if (e.button !== 0) return;

  const action = card.currentClickAction;
  if (!action) return;
  e.stopPropagation();

  action.handler(card);
};
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
  >
    <GameCard
      variant="small"
      :card-id="card.id"
      show-stats
      :overrides="{ power: card.power, damage: card.damage, hp: card.hp }"
    />
    <ModifiersList :modifiers="modifiers" class="modifiers" />
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

  &.is-exhausted:not(.is-being-played):deep(:is(.art-main, .art-bg)) {
    filter: grayscale(35%) brightness(65%);
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
  top: 7px;
  transform: translateZ(2px);
}

.modifiers {
  position: absolute;
  top: calc(3px * var(--pixel-scale));
  left: calc(3px * var(--pixel-scale));
  right: calc(3px * var(--pixel-scale));
  transform: translateZ(2px);
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
