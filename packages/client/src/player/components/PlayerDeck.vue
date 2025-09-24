<script setup lang="ts">
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';

export type DisplayedDeck = {
  name: string;
  hero: string;
  mainDeck: { blueprintId: string }[];
};
const { deck } = defineProps<{
  deck: DisplayedDeck;
}>();

const hero = computed(() => {
  return deck.hero ? CARDS_DICTIONARY[deck.hero] : null;
});

// const affinities = computed(() => {
//   const result = new Set<Affinity>();
//   deck.mainDeck.forEach(card => {
//     const blueprint = CARDS_DICTIONARY[card.blueprintId];
//     if (!blueprint) return;
//     if (blueprint.affinity !== AFFINITIES.NORMAL) {
//       result.add(blueprint.affinity);
//     }
//   });
//   return Array.from(result);
// });
</script>

<template>
  <article
    class="player-deck"
    :style="{
      '--bg': `url(/assets/icons/${hero?.cardIconId}.png)`
    }"
  >
    <button class="deck-name">
      {{ deck.name }}
    </button>

    <!-- <div
      v-for="affinity in affinities"
      :key="affinity"
      class="deck-affinity"
      :style="{
        '--bg': `url('/assets/ui/affinity-${affinity.toLowerCase()}.png')`
      }"
    /> -->
  </article>
</template>

<style scoped lang="postcss">
.player-deck {
  display: flex;
  gap: var(--size-2);
  align-items: center;
  background-image:
    linear-gradient(to right, hsl(0deg 0% 0% / 0.5), hsl(0deg 0% 0% / 0.5)),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    left center;
  background-size: 200%, calc(2px * 96);
  border: solid 1px var(--primary);
  padding: var(--size-2);
}

.deck-name {
  flex: 1 1 0%;
  text-align: left;
  align-self: stretch;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  text-shadow: 0 0 1rem 1rem black;
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  @screen lt-lg {
    font-size: var(--font-size-1);
  }
}

.deck-affinity {
  background: var(--bg);
  background-size: cover;
  background-position: center;
  width: calc(1 * 26px);
  height: calc(1 * 28px);
}
</style>
