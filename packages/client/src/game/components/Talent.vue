<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import GameCard from './GameCard.vue';
import { useGameUi } from '../composables/useGameClient';

const { card } = defineProps<{
  card: CardViewModel | null;
}>();

const ui = useGameUi();
</script>

<template>
  <div class="talent">
    <div>
      <GameCard
        v-if="card"
        :card-id="card.id"
        :is-interactive="false"
        class="card"
        @mouseenter="ui.hover(card)"
        @mouseleave="ui.unhover()"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.talent {
  width: 48px;
  aspect-ratio: 1;
  background: url('@/assets/ui/talent-node.png');
  overflow: hidden;
  > div {
    width: 100%;
    height: 100%;
    mask-image: url('@/assets/ui/talent-node-mask.png');
    mask-size: cover;
  }
}

.card {
  translate: -150px -150px;
}
</style>
