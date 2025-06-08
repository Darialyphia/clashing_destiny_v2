<script setup lang="ts">
import { useCard } from '@/game/composables/useGameClient';
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  type HoverCardContentProps,
  type HoverCardRootProps
} from 'reka-ui';
import GameCard from '@/game/components/GameCard.vue';

const { cardId, side } = defineProps<
  { cardId: string } & Pick<HoverCardContentProps, 'side'> &
    Pick<HoverCardRootProps, 'openDelay' | 'closeDelay'>
>();

const card = useCard(computed(() => cardId));
</script>

<template>
  <HoverCardRoot :open-delay="openDelay" :close-delay="closeDelay">
    <HoverCardTrigger class="inspectable-card">
      <slot />
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent>
        <GameCard :card-id="cardId" :interactive="false" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>
