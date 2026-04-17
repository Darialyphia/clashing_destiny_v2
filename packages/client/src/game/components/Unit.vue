<script setup lang="ts">
import type { UnitViewModel } from '@game/engine/src/client/view-models/unit.model';
import { useGameUi } from '../composables/useGameClient';
import { useIsInAoe } from '../composables/useIsInAoe';
import GameCard from './GameCard.vue';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useGameUi();
const isInAoe = useIsInAoe();

const element = ref<HTMLElement>();
onMounted(() => {
  element.value = ui.value.DOMSelectors.unit(unit.id).element!;
});
</script>

<template>
  <div
    :id="ui.DOMSelectors.unit(unit.id).id"
    class="unit"
    :class="[
      {
        'in-aoe': isInAoe({ x: unit.x, y: unit.y }),
        'is-exhausted': unit.isExhausted,
        'is-selected': ui.selectedUnit?.equals(unit)
      }
    ]"
  >
    <GameCard variant="small" :card-id="unit.cardId" show-stats />
  </div>
</template>

<style scoped lang="postcss">
.unit {
  --pixel-scale: 2;
  position: relative;
  width: 100%;
  height: 100%;
  bottom: 0;

  &.is-inverted :deep(.sprite-wrapper) {
    scale: -2 2;
  }

  &.is-flipped {
    transform: translateZ(15px) translateY(-105px) translateX(-0px)
      rotateY(-0deg) rotateX(calc(-1 * var(--board-angle-X) + 270deg))
      scaleX(-1);
  }
}

.unit.is-exhausted :deep(.sprite) {
  filter: grayscale(100%) brightness(70%);
}
</style>
