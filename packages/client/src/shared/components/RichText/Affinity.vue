<script setup lang="ts">
import { assets } from '@/assets';

const { affinities } = defineProps<{
  affinities: string;
}>();

const affinityArray = computed(() => {
  return affinities
    .replaceAll(' ', '')
    .split(',')
    .map(r => r.trim()) as string[];
});
</script>

<template>
  <span class="affinities">
    <span
      v-for="(affinity, index) in affinityArray"
      :key="index"
      class="affinity"
      :style="{
        '--bg':
          assets[`ui/card/v3/affinity-${affinity.toLocaleLowerCase()}`]?.css
      }"
    />
  </span>
</template>

<style scoped lang="postcss">
.affinities {
  display: inline-flex;
  gap: calc(1px * var(--pixel-scale));
  padding-right: 0.5ch;
  translate: 0 calc(3px * var(--pixel-scale));
}

.affinity {
  background: var(--bg) no-repeat center center;
  background-size: cover;
  width: calc(13px * var(--pixel-scale));
  height: calc(13px * var(--pixel-scale));
}
</style>
