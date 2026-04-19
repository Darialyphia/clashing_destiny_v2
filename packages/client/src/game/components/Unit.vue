<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import {
  useFxEvent,
  useGameClient,
  useGameUi
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { useVFXStep } from '../composables/useVFXStep';
import { waitFor } from '@game/shared';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { until } from '@vueuse/core';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useGameUi();
const { playerId } = useGameClient();

const element = ref<HTMLElement>();
onMounted(() => {
  element.value = ui.value.DOMSelectors.unit(unit.id).element!;
});

const isBeingDropped = ref(false);
const dropScale = ref(1);
const dropDuration = ref('');
useVFXStep('dropUnit', async step => {
  if (step.params.unitId !== unit.id) return;
  dropScale.value = step.params.from.scale;
  dropDuration.value = `${step.params.duration}ms`;
  isBeingDropped.value = true;

  await waitFor(step.params.duration);
  isBeingDropped.value = false;
});

const unitEl = useTemplateRef('unit');

const isAttacking = ref(false);
const onAttack = async (event: { attacker: string }) => {
  if (event.attacker !== unit.id) return;

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
};

useFxEvent(FX_EVENTS.COMBAT_BEFORE_ATTACK, onAttack);
useFxEvent(FX_EVENTS.COMBAT_BEFORE_COUNTERATTACK, onAttack);

const isTakingDamage = ref(false);
useFxEvent(FX_EVENTS.COMBAT_BEFORE_RECEIVE_DAMAGE, async event => {
  if (event.target !== unit.id) return;

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
</script>

<template>
  <div
    ref="unit"
    :id="ui.DOMSelectors.unit(unit.id).id"
    class="unit"
    :class="[
      {
        'is-exhausted': unit.isExhausted,
        'is-selected': ui.selectedUnit?.equals(unit),
        'is-being-dropped': isBeingDropped,
        'is-attacking': isAttacking,
        'is-taking-damage': isTakingDamage
      }
    ]"
  >
    <GameCard variant="small" :card-id="unit.cardId" show-stats />
  </div>
</template>

<style scoped lang="postcss">
.unit {
  --pixel-scale: 2;
  width: 100%;
  height: 100%;
  transition: all 0.3s var(--ease-2);

  &.is-selected {
    translate: 0 -6px;
    box-shadow: 0 6px 30px 4px black;
  }

  &.is-exhausted:not(.is-being-dropped) {
    filter: grayscale(35%) brightness(50%);
  }

  &.is-being-dropped {
    animation: drop v-bind(dropDuration) ease-out forwards;
  }

  &.is-attacking {
    animation: unit-attack 0.2s linear;
  }

  &.is-taking-damage {
    animation:
      unit-take-damage 0.3s ease-in-out,
      unit-take-damage-shake 0.3s linear;
  }
}

@keyframes drop {
  0% {
    scale: v-bind(dropScale);
    translate: 0 -50px;
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
