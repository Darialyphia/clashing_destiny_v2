<script setup lang="ts">
import { useRichTextContext } from '@/game/composables/useRichText';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import type { JobId } from '@game/engine/src/card/card.enums';
import { uppercaseFirstLetter } from '@game/shared';

const { job } = defineProps<{
  job: string;
}>();

const ctx = useRichTextContext();
</script>

<template>
  <span
    class="job-bonus"
    :class="{
      disabled:
        ctx && !ctx.heroJobs.value.includes(job.toLocaleUpperCase() as JobId)
    }"
  >
    <UiSimpleTooltip>
      <template #trigger>
        <span class="badge">{{ uppercaseFirstLetter(job) }}</span>
      </template>

      Activates if your hero's class is {{ uppercaseFirstLetter(job) }}.
    </UiSimpleTooltip>
    <slot />
  </span>
</template>

<style scoped lang="postcss">
.badge {
  background: linear-gradient(
    to bottom,
    var(--indigo-4) 50%,
    var(--indigo-6) 50%
  );
  line-height: 1.8;
  border: solid calc(0.5px * var(--pixel-scale)) var(--indigo-8);
  color: white;
  font-size: 0.95em;
  padding-inline: calc(4px * var(--pixel-scale));
  border-radius: var(--radius-pill);
  font-family: var(--font-system-ui);
  font-weight: var(--font-weight-5);
  -webkit-text-stroke: calc(1.5px * var(--pixel-scale)) black;
  paint-order: stroke fill;
  padding-bottom: calc(1px * var(--pixel-scale));
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
