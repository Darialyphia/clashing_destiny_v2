<script setup lang="ts">
import type { Affinity } from '@game/engine/src/card/card.enums';

const { affinities } = defineProps<{
  affinities: Affinity[];
}>();
</script>

<template>
  <div class="affinity-flags parallax" v-if="affinities.length > 0">
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
    &[data-affinity='songhai'] {
      background-image: url('@/assets/ui/card/v3/affinity-songhai.png');
    }
    &[data-affinity='vanar'] {
      background-image: url('@/assets/ui/card/v3/affinity-vanar.png');
    }
    &[data-affinity='magmar'] {
      background-image: url('@/assets/ui/card/v3/affinity-magmar.png');
    }
    &[data-affinity='vetruvian'] {
      background-image: url('@/assets/ui/card/v3/affinity-vetruvian.png');
    }
    &[data-affinity='lyonar'] {
      background-image: url('@/assets/ui/card/v3/affinity-lyonar.png');
    }
    &[data-affinity='abyssian'] {
      background-image: url('@/assets/ui/card/v3/affinity-abyssian.png');
    }
    &[data-affinity='neutral'] {
      background-image: url('@/assets/ui/card/v3/affinity-neutral.png');
    }
  }
}
</style>
