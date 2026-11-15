<script setup lang="ts">
import { isDefined } from '@game/shared';

const { cost, baseCost } = defineProps<{
  cost: number | string;
  baseCost: number | string;
}>();

const costStatus = computed(() => {
  if (!isDefined(baseCost) || baseCost === cost) return '';

  return cost < baseCost ? 'buffed' : 'debuffed';
});
</script>

<template>
  <div class="mana-cost parallax" :class="costStatus">
    <div
      class="dual-text"
      :data-text="cost"
      style="--dual-text-stroke-offset-y: calc(-2px * var(--pixel-scale))"
    >
      {{ cost }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
.mana-cost {
  position: absolute;
  top: calc(0px * var(--pixel-scale));
  left: calc(0px * var(--pixel-scale));
  background-image: url('@/assets/ui/card/v3/mana-cost.png');
  background-size: cover;
  font-weight: var(--font-weight-7);
  font-size: calc(var(--pixel-scale) * 16px);
  width: calc(29px * var(--pixel-scale));
  height: calc(29px * var(--pixel-scale));
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  z-index: 0;
  color: transparent;
  .buffed {
    color: var(--green-2);
  }
  .debuffed {
    color: var(--red-3);
  }
}
</style>
