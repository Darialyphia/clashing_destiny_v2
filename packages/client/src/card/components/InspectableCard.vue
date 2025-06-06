<script setup lang="ts">
import { useCard } from '@/game/composables/useGameClient';
import {
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  HoverCardContent,
  type HoverCardContentProps
} from 'reka-ui';
import GameCard from '@/game/components/GameCard.vue';

const { cardId, side } = defineProps<
  { cardId: string } & Pick<HoverCardContentProps, 'side'>
>();

const card = useCard(cardId);
</script>

<template>
  <HoverCardRoot>
    <HoverCardTrigger class="card">
      <slot />
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent>
        <GameCard :card-id="cardId" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>
