<script setup lang="ts">
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  type HoverCardContentProps,
  type HoverCardRootProps
} from 'reka-ui';
import GameCard from '@/game/components/GameCard.vue';
import { useGameUi } from '@/game/composables/useGameClient';

defineOptions({
  inheritAttrs: false
});

const {
  cardId,
  side,
  sideOffset,
  align,
  closeDelay = 0,
  openDelay = 0,
  enabled = true,
  pixelScale = 1.5
} = defineProps<
  { cardId: string; enabled?: boolean; pixelScale?: number } & Pick<
    HoverCardContentProps,
    'side' | 'sideOffset' | 'align'
  > &
    Pick<HoverCardRootProps, 'openDelay' | 'closeDelay'>
>();

const ui = useGameUi();
</script>

<template>
  <HoverCardRoot :open-delay="openDelay" :close-delay="closeDelay">
    <HoverCardTrigger class="inspectable-card" v-bind="$attrs">
      <slot />
    </HoverCardTrigger>
    <HoverCardPortal to="#card-portal">
      <HoverCardContent
        v-if="!ui.draggedCard && enabled"
        :side="side"
        :side-offset="sideOffset"
        :align="align"
      >
        <GameCard
          :card-id="cardId"
          :interactive="false"
          :pixel-scale="pixelScale"
        />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>
