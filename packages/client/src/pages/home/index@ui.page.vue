<script setup lang="ts">
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import BlueprintSmallCard from '@/card/components/BlueprintSmallCard.vue';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { domToPng } from 'modern-screenshot';

definePage({
  name: 'Home',
  path: '/'
});

const screenshot = async (id: string, e: MouseEvent) => {
  const card = (e.target as HTMLElement)?.querySelector(
    '.card-front'
  ) as HTMLElement;
  const png = await domToPng(card, {
    backgroundColor: 'transparent'
  });
  const a = document.createElement('a');
  a.href = png;
  a.download = `${id}.png`;
  a.click();
};

const isFoil = ref(false);
const spin = ref(false);
const card = ref('aiden-lv1');
</script>

<template>
  <nav class="grid h-screen place-content-center">
    <!-- <ul class="flex gap-4 surface">
      <li>
        <RouterLink :to="{ name: 'HowToPlay' }">How to play</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'TutorialList' }">Tutorial</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
      </li>
    </ul> -->

    <fieldset>
      <legend>Card</legend>
      <label>
        Hero
        <input v-model="card" type="radio" value="aiden-lv1" />
      </label>
      <label>
        Spell
        <input v-model="card" type="radio" value="fire-bolt" />
      </label>
    </fieldset>
    <br />

    <fieldset class="flex gap-3">
      <legend>Options</legend>
      <label>
        <input type="checkbox" v-model="isFoil" />
        Foil
      </label>
      <label>
        <input type="checkbox" v-model="spin" />
        Spin
      </label>
    </fieldset>

    <br />
    <div class="wrapper" ref="wrapper">
      <BlueprintCard
        :blueprint="CARDS_DICTIONARY[card]"
        :class="spin && 'card-spin'"
        :is-foil="isFoil"
        @dblclick="screenshot(card, $event)"
      />

      <BlueprintSmallCard
        :blueprint="CARDS_DICTIONARY[card]"
        :class="spin && 'card-spin'"
        :is-foil="isFoil"
        :style="{ '--pixel-scale': 1 }"
        @dblclick="screenshot(card, $event)"
      />
    </div>
  </nav>
</template>

<style scoped lang="postcss">
li {
  padding: var(--size-3);
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-5);
}

li:hover {
  background: hsl(40 60% 60% / 0.15);
}

.wrapper {
  transform-style: preserve-3d;
  perspective: 700px;
  display: flex;
  gap: var(--size-5);
}

@keyframes spin {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}
.card-spin {
  animation: spin 10s linear infinite;
}
</style>
