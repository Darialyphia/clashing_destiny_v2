<script setup lang="ts">
import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  type TooltipContentProps
} from 'reka-ui';

export type UITooltipProps = {
  sideOffset?: number;
  delay?: number;
  side?: TooltipContentProps['side'];
  align?: TooltipContentProps['align'];
  usePortal?: boolean;
};

const {
  sideOffset = 0,
  side = 'top',
  align = 'center',
  usePortal = true
} = defineProps<UITooltipProps>();
</script>

<template>
  <TooltipRoot>
    <TooltipTrigger v-slot="triggerProps" as-child>
      <slot name="trigger" v-bind="triggerProps" />
    </TooltipTrigger>
    <TooltipPortal :disabled="!usePortal">
      <TooltipContent
        v-slot="contentProps"
        class="select-none"
        :side-offset="sideOffset"
        :side="side"
        :align="align"
      >
        <div class="tooltip-content">
          <slot v-bind="contentProps" />
        </div>
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<style lang="postcss" scoped>
.tooltip-content {
  background-color: black;
  color: white;
  padding: var(--size-1) var(--size-3);
  font-family: var(--font-system-ui);
  font-size: 14px;
  border: solid 1px #bb8225;
  max-width: 40ch;
}
</style>
