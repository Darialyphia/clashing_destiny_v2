<script setup lang="ts">
import { assets } from '@/assets';
import { RARITIES, type Rarity } from '@game/engine/src/card/card.enums';

const { rarity } = defineProps<{
  rarity: Rarity;
}>();

const rarityBg = computed(() => {
  if (
    [RARITIES.BASIC, RARITIES.COMMON, RARITIES.TOKEN].includes(rarity as any)
  ) {
    return assets[`ui/card/v3/rarity-common`].css;
  }

  return assets[`ui/card/v3/rarity-${rarity}`].css;
});
</script>

<template>
  <div class="rarity parallax" />
</template>

<style scoped lang="postcss">
.rarity {
  position: absolute;
  top: calc(80px * var(--pixel-scale));
  left: 50%;
  transform: translateX(calc(-50% - 1px * var(--pixel-scale)));
  width: calc(11px * var(--pixel-scale));
  height: calc(12px * var(--pixel-scale));
  background-image: v-bind(rarityBg);
  background-size: cover;
}
</style>
