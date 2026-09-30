<script setup lang="ts">
import type { Nullable } from '@game/shared';
import SpriteFX from '../SpriteFX.vue';

const { latestDamageAmount, latestHealAmount } = defineProps<{
  latestDamageAmount: Nullable<number>;
  latestHealAmount: Nullable<number>;
}>();
</script>

<template>
  <SpriteFX
    v-if="latestDamageAmount"
    class="fx-container"
    :sprites="[
      {
        spriteId: 'fx/impact',
        animationSequence: ['impactorangebig'],
        scale: 1.5,
        offset: {
          x: 0,
          y: 0
        }
      },
      {
        spriteId: 'fx/collision',
        animationSequence: ['collisionsparksblue'],
        scale: 1.5,
        offset: {
          x: -10,
          y: 10
        }
      }
    ]"
  />

  <SpriteFX
    v-if="latestHealAmount"
    class="fx-container"
    :sprites="[
      {
        spriteId: 'fx/fx_heal',
        animationSequence: ['default'],
        scale: 1.5,
        offset: {
          x: 0,
          y: -20
        }
      }
    ]"
  />
</template>

<style scoped lang="postcss">
.fx-container {
  position: absolute;
  inset: 0;
  transform: translateZ(10px);
}
</style>
