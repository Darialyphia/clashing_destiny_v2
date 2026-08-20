<script setup lang="ts">
import { isDefined } from '@game/shared';

const { cost, baseCost, manaSupply } = defineProps<{
  cost: number;
  baseCost: number;
  manaSupply?: number | null;
}>();

const costStatus = computed(() => {
  if (!isDefined(baseCost) || baseCost === cost) return '';

  return cost < baseCost ? 'buffed' : 'debuffed';
});
</script>

<template>
  <div class="mana-cost" :class="costStatus">
    {{ cost }}
    <div class="supply">
      <div
        v-if="isDefined(manaSupply)"
        style="--dual-text-stroke-offset-y: calc(-2px * var(--pixel-scale))"
      >
        +{{ manaSupply ?? 0 }}
      </div>
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
  z-index: 0;
  .buffed {
    color: var(--green-2);
  }
  .debuffed {
    color: var(--red-3);
  }
}

.supply {
  position: absolute;
  bottom: calc(4px * var(--pixel-scale));
  right: calc(-25px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 12px);

  width: calc(24px * var(--pixel-scale));
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  background-image: url('@/assets/ui/card/mana-supply.png');
  background-size: cover;
  padding-top: calc(2px * var(--pixel-scale));
}
</style>
