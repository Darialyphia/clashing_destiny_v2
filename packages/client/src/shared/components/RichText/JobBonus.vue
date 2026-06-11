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
        ctx?.card?.value &&
        !ctx.card?.value?.player.hero?.jobs.includes(
          job.toLocaleUpperCase() as JobId
        )
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
    var(--yellow-5) 50%,
    var(--yellow-7) 50%
  );
  border: solid calc(0.5px * var(--pixel-scale)) var(--yellow-9);
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
