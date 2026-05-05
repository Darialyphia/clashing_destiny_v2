<script setup lang="ts">
import { useRichTextContext } from '@/game/composables/useRichText';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

const { lvl } = defineProps<{
  lvl: number | string;
}>();

const ctx = useRichTextContext();
</script>

<template>
  <span
    class="lvl-bonus"
    :class="{
      disabled: ctx && ctx.heroLevel.value < Number(lvl)
    }"
  >
    <UiSimpleTooltip>
      <template #trigger>
        <span class="badge">Lvl {{ lvl }}</span>
      </template>
      Activates if your hero's level is {{ lvl }} or higher.
    </UiSimpleTooltip>
    <slot />
  </span>
</template>

<style scoped lang="postcss">
.badge {
  line-height: 1.8;
  background: linear-gradient(
    to bottom,
    var(--yellow-4) 50%,
    var(--yellow-6) 50%
  );
  border: solid calc(0.5px * var(--pixel-scale)) var(--yellow-8);
  color: black;
  font-size: 0.95em;
  padding-inline: calc(4px * var(--pixel-scale));
  border-radius: var(--radius-pill);
  font-family: var(--font-system-ui);
  font-weight: var(--font-weight-5);
  -webkit-text-stroke: calc(1px * var(--pixel-scale)) white;
  paint-order: stroke fill;
  margin-right: 1ch;
}
.disabled {
  opacity: 0.6;
  > .badge {
    background: var(--gray-4);
    border-color: var(--gray-6);
  }
}
</style>
