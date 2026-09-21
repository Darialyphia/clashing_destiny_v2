<script setup lang="ts">
import type { Rune } from '@game/engine/src/player/player.enums';
import { assets } from '@/assets';

const { cost } = defineProps<{
  cost: Rune[];
}>();
</script>

<template>
  <div class="rune-cost">
    <template v-for="(rune, index) in cost" :key="index">
      <span
        class="rune"
        :style="{
          '--bg': assets[`ui/card/rune-${rune.toLocaleLowerCase()}-large`].css
        }"
      />
    </template>
  </div>
</template>

<style scoped lang="postcss">
.rune-cost {
  position: absolute;
  top: calc(5px * var(--pixel-scale));
  left: calc(38px * var(--pixel-scale));
  display: flex;
  gap: calc(2px * var(--pixel-scale));
}

.rune {
  background: var(--bg) no-repeat center center;
  background-size: cover;
  font-weight: var(--font-weight-5);
  border-radius: var(--radius-round);
  width: calc(29px * var(--pixel-scale));
  height: calc(30px * var(--pixel-scale));
}
</style>
