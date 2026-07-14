<script setup lang="ts">
import type { Affinity } from '@game/engine/src/card/card.enums';

const { affinities } = defineProps<{
  affinities: Affinity[];
}>();
</script>

<template>
  <div class="affinity-flags">
    <div
      v-for="(affinity, index) in affinities"
      :key="index"
      class="affinity-flag"
      :data-affinity="affinity.toLocaleLowerCase()"
    />
  </div>
</template>

<style scoped lang="postcss">
.affinity-flags {
  position: absolute;
  top: 0;
  right: calc(5px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  gap: calc(2px * var(--pixel-scale));
  z-index: 1;

  .affinity-flag {
    width: calc(30px * var(--pixel-scale));
    height: calc(34px * var(--pixel-scale));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    translate: 0 calc((-1 + var(--child-index)) * -10px * var(--pixel-scale));
    position: relative;
    z-index: calc(10 - var(--child-index));
    &[data-affinity='fire'] {
      background-image: url('@/assets/ui/card/v2/affinity-flag-fire.png');
    }
    &[data-affinity='water'] {
      background-image: url('@/assets/ui/card/v2/affinity-flag-water.png');
    }
    &[data-affinity='earth'] {
      background-image: url('@/assets/ui/card/v2/affinity-flag-earth.png');
    }
    &[data-affinity='air'] {
      background-image: url('@/assets/ui/card/v2/affinity-flag-air.png');
    }
    &[data-affinity='light'] {
      background-image: url('@/assets/ui/card/v2/affinity-flag-light.png');
    }
    &[data-affinity='dark'] {
      background-image: url('@/assets/ui/card/v2/affinity-flag-dark.png');
    }
    &[data-affinity='arcane'] {
      background-image: url('@/assets/ui/card/v2/affinity-flag-arcane.png');
    }
    &[data-affinity='neutral'] {
      background-image: url('@/assets/ui/card/v2/affinity-flag-neutral.png');
    }
  }
}
</style>
