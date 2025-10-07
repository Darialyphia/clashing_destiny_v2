<script setup lang="ts">
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';

export type DisplayedDeck = {
  name: string;
  mainDeck: { blueprintId: string }[];
  destinyDeck: { blueprintId: string }[];
};
const { deck } = defineProps<{
  deck: DisplayedDeck;
}>();

const hero = computed(() => {
  const heroes = deck.destinyDeck
    .map(card => CARDS_DICTIONARY[card.blueprintId])
    .filter(c => c.kind === CARD_KINDS.HERO);
  return heroes.sort((a, b) => b.level - a.level)[0];
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
  <button
    class="player-deck"
    :style="{
      '--bg': `url(/assets/cards/${hero?.cardIconId}.png)`
    }"
  >
    <div class="deck-name">
      {{ deck.name }}
      <div class="flex gap-1" v-if="hero">
        <img
          v-for="jobs in hero.jobs"
          :key="jobs"
          :src="`/assets/ui/jobs-${jobs.toLowerCase()}.png`"
          class="job"
        />
        <img
          v-for="spellSchool in hero.spellSchools"
          :key="spellSchool"
          :src="`/assets/ui/spell-school-${spellSchool.toLowerCase()}.png`"
          class="spell-school"
        />
      </div>
    </div>

    <!-- <div
      v-for="affinity in affinities"
      :key="affinity"
      class="deck-affinity"
      :style="{
        '--bg': `url('/assets/ui/affinity-${affinity.toLowerCase()}.png')`
      }"
    /> -->
  </button>
</template>

<style scoped lang="postcss">
.player-deck {
  display: flex;
  width: 100%;
  gap: var(--size-2);
  align-items: center;
  background-image:
    linear-gradient(to right, hsl(0deg 0% 20% / 0.5), hsl(0deg 0% 0% / 0.5)),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    right calc(100% + 70px);
  background-size: 200%, calc(2px * 96);
  padding: var(--size-2) var(--size-4);
  border: solid 1px hsl(var(--color-primary-hsl) / 0.5);
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

.job,
.spell-school {
  --pixel-scale: 2;
  width: calc(22px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
}
</style>
