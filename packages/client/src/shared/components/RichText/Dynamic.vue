<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';

const { tooltip } = defineProps<{
  tooltip: string;
}>();
</script>

<template>
  <HoverCardRoot :open-delay="250" :close-delay="0">
    <HoverCardTrigger>
      <span class="dynamic-value"><slot /></span>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent class="z-10" side="top">
        <article>
          {{ tooltip }}
        </article>
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.dynamic-value {
  color: var(--yellow-5);
  font-weight: var(--font-weight-8);
  -webkit-text-stroke: calc(1px * var(--pixel-scale)) black;
  paint-order: stroke fill;
}

article {
  max-width: 30ch;
  padding: var(--size-3);
  color: var(--text-1);
  background-color: black;
  color: #efef9f;
  padding: var(--size-2) var(--size-3);
  font-family: var(--font-system-ui);
  font-size: 14px;
  border: solid 1px #bb8225;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
</style>
