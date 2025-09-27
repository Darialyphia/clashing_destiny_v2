<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useBoardSide,
  useCard,
  useGameClient
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const boardSide = useBoardSide(computed(() => player.id));
const hero = useCard(computed(() => boardSide.value.heroZone.hero));
const client = useGameClient();
</script>

<template>
  <div
    class="hero-slot"
    :class="{ opponent: client.playerId !== player.id }"
    :id="client.ui.DOMSelectors.hero(player.id).id"
    ref="card"
  >
    <GameCard :card-id="hero.id" actions-side="bottom" :actions-offset="15" />
  </div>
</template>

<style scoped lang="postcss"></style>
