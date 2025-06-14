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

const {
  cardId,
  side,
  sideOffset,
  closeDelay = 0,
  openDelay
} = defineProps<
  { cardId: string } & Pick<HoverCardContentProps, 'side' | 'sideOffset'> &
    Pick<HoverCardRootProps, 'openDelay' | 'closeDelay'>
>();
</script>

<template>
  <HoverCardRoot :open-delay="openDelay" :close-delay="closeDelay">
    <HoverCardTrigger class="inspectable-card">
      <slot />
    </HoverCardTrigger>
    <HoverCardPortal to="#card-portal">
      <HoverCardContent :side="side" :side-offset="sideOffset">
        <GameCard :card-id="cardId" :interactive="false" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>
