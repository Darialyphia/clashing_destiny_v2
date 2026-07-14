<script setup lang="ts">
import { isDefined } from '@game/shared';

const { cost, baseCost } = defineProps<{
  cost: number;
  baseCost: number;
}>();

const costStatus = computed(() => {
  if (!isDefined(baseCost) || baseCost === cost) return '';

  return cost < baseCost ? 'buffed' : 'debuffed';
});
</script>

<template>
  <div class="mana-cost" :class="costStatus">
    <div class="" :data-text="cost">
      {{ cost }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
.mana-cost {
  background-image: url('@/assets/ui/card/v2/mana-cost.png');
  background-size: cover;
  font-weight: var(--font-weight-7);
  font-size: calc(var(--pixel-scale) * 16px);
  padding-bottom: calc(6px * var(--pixel-scale));
  width: calc(29px * var(--pixel-scale));
  height: calc(32px * var(--pixel-scale));
  aspect-ratio: 1;
  position: absolute;
  top: calc(5px * var(--pixel-scale));
  left: calc(5px * var(--pixel-scale));
  display: grid;
  place-items: center;
  -webkit-text-stroke: calc(3px * var(--pixel-scale)) black;
  paint-order: stroke fill;
  color: #e9d8c0;

  .buffed {
    color: var(--green-2);
  }
  .debuffed {
    color: var(--red-3);
  }
}
</style>
