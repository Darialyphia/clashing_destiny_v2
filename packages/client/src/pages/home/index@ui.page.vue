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
    <div class="wrapper" ref="wrapper">
      <BlueprintCard
        :blueprint="CARDS_DICTIONARY['aiden-lv1']"
        class="card-spin"
        @dblclick="screenshot('aiden-lv1', $event)"
      />

      <BlueprintSmallCard
        :blueprint="CARDS_DICTIONARY['aiden-lv1']"
        class="card-spin"
        :style="{ '--pixel-scale': 1 }"
        @dblclick="screenshot('aiden-lv1', $event)"
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
