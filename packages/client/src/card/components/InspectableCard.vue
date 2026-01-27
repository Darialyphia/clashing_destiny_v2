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
  closeDelay = 0,
  openDelay = 0,
  enabled = true
} = defineProps<
  { cardId: string; enabled?: boolean } & Pick<
    HoverCardContentProps,
    'side' | 'sideOffset'
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
        style="--pixel-scale: 2"
      >
        <GameCard :card-id="cardId" :interactive="false" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>
