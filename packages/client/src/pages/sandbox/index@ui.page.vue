<script setup lang="ts">
import Sandbox from '@/game/components/Sandbox.vue';
import { premadeDecks } from '@/utils/premade-decks';

definePage({
  name: 'Sandbox'
});
</script>

<template>
  <Sandbox
    :players="[
      {
        id: 'p1',
        name: 'Player 1',
        destinyDeck: premadeDecks[0].destinyDeck,
        mainDeck: premadeDecks[0].mainDeck
      },
      {
        id: 'p2',
        name: 'Player 2',
        destinyDeck: premadeDecks[0].destinyDeck,
        mainDeck: premadeDecks[0].mainDeck
      }
    ]"
  />
</template>

<style scoped lang="postcss"></style>
