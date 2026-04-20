<script setup lang="ts">
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import {
  HoverCardRoot,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
const el = useTemplateRef('el');

const card = computed(() => {
  const text = el.value?.textContent || '';
  return Object.values(CARDS_DICTIONARY).find(card => {
    return card.name === text;
  });
});
</script>

<template>
  <HoverCardRoot :open-delay="250" :close-delay="0">
    <HoverCardTrigger>
      <span class="card" tabindex="0" ref="el"><slot /></span>
    </HoverCardTrigger>
    <HoverCardPortal>
      <HoverCardContent class="z-10" side="top">
        <BlueprintCard v-if="card" :blueprint="card" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.card {
  text-decoration: underline;
}
</style>
