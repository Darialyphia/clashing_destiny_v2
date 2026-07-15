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
    return assets[`ui/card/v2/rarity-common`].css;
  }

  return assets[`ui/card/v2/rarity-${rarity}`].css;
});
</script>

<template>
  <div class="rarity parallax" />
</template>

<style scoped lang="postcss">
.rarity {
  position: absolute;
  bottom: calc(2px * var(--pixel-scale));
  left: 50%;
  translate: -50% 0;
  width: calc(15px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  background-image: v-bind(rarityBg);
  background-size: cover;
}
</style>
