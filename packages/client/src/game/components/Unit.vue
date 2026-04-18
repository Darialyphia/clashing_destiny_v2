<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { useGameUi } from '../composables/useGameClient';
import { useIsInAoe } from '../composables/useIsInAoe';
import GameCard from './GameCard.vue';
import { useVFXStep } from '../composables/useVFXStep';
import { waitFor } from '@game/shared';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useGameUi();
const isInAoe = useIsInAoe();

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
</script>

<template>
  <div
    :id="ui.DOMSelectors.unit(unit.id).id"
    class="unit"
    :class="[
      {
        'is-exhausted': unit.isExhausted,
        'is-selected': ui.selectedUnit?.equals(unit),
        'is-being-dropped': isBeingDropped
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
}

@keyframes drop {
  0% {
    scale: v-bind(dropScale);
    translate: 0 -50px;
    opacity: 0;
  }
}
</style>
