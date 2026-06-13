<script setup lang="ts">
import type { Rune } from '@game/engine/src/player/player.enums';
import { assets } from '@/assets';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

const { runes } = defineProps<{
  runes: string;
}>();

const runesArray = computed(() => {
  return runes.split(',').map(r => r.trim()) as Rune[];
});

const tooltip = computed(() => {
  const counts: Record<string, number> = {};
  runesArray.value.forEach(r => {
    counts[r] = (counts[r] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([rune, count]) => `${count} ${rune} rune${count > 1 ? 's' : ''}`)
    .join(', ');
});
</script>

<template>
  <UiSimpleTooltip>
    <template #trigger>
      <span class="runes">
        <template v-for="(rune, index) in runesArray" :key="index">
          <span
            class="rune"
            :style="{
              '--bg': assets[`ui/card/rune-${rune.toLocaleLowerCase()}`].css
            }"
          />
        </template>
      </span>
    </template>

    {{ tooltip }}
  </UiSimpleTooltip>
</template>

<style scoped lang="postcss">
.runes {
  display: inline-flex;
  gap: calc(1px * var(--pixel-scale));
  padding-right: 0.5ch;
}
.rune {
  background: var(--bg) no-repeat center center;
  background-size: cover;
  font-weight: var(--font-weight-5);
  border-radius: var(--radius-round);
  width: calc(17px * var(--pixel-scale) / 2);
  height: calc(18px * var(--pixel-scale) / 2);

  translate: 0 calc(2px * var(--pixel-scale));
}
</style>
