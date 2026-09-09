<script setup lang="ts">
import type { Affinity } from '@game/engine/src/card/card.enums';

const { affinities } = defineProps<{
  affinities: Affinity[];
}>();
</script>

<template>
  <div class="affinity-flags" v-if="affinities.length > 0">
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
  display: flex;
  gap: calc(1px * var(--pixel-scale));
  z-index: 1;
  position: absolute;
  left: calc(30px * var(--pixel-scale));
  top: calc(1px * var(--pixel-scale));

  .affinity-flag {
    width: calc(13px * var(--pixel-scale));
    height: calc(13px * var(--pixel-scale));
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    &[data-affinity='fire'] {
      background-image: url('@/assets/ui/card/v3/affinity-fire.png');
    }
    &[data-affinity='water'] {
      background-image: url('@/assets/ui/card/v3/affinity-water.png');
    }
    &[data-affinity='earth'] {
      background-image: url('@/assets/ui/card/v3/affinity-earth.png');
    }
    &[data-affinity='air'] {
      background-image: url('@/assets/ui/card/v3/affinity-air.png');
    }
    &[data-affinity='light'] {
      background-image: url('@/assets/ui/card/v3/affinity-light.png');
    }
    &[data-affinity='dark'] {
      background-image: url('@/assets/ui/card/v3/affinity-dark.png');
    }
    &[data-affinity='arcane'] {
      background-image: url('@/assets/ui/card/v3/affinity-arcane.png');
    }
    &[data-affinity='neutral'] {
      background-image: url('@/assets/ui/card/v3/affinity-neutral.png');
    }
  }
}
</style>
