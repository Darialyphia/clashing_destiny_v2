<script setup lang="ts">
import { useMyBoard } from '@/game/composables/useGameClient';

const props = defineProps<{}>();
const emit = defineEmits<{}>();

const myBoard = useMyBoard();
</script>

<template>
  <section
    class="hand"
    :style="{ '--hand-size': myBoard.hand.length, '--angle': 5 }"
  >
    <div
      class="card"
      v-for="(cardId, index) in myBoard.hand"
      :key="cardId"
      :style="{ '--index': index }"
    >
      <GameCard :card-id="cardId" />
    </div>
  </section>
</template>

<style scoped lang="postcss"></style>
