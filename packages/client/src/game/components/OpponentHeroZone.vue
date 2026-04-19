<script setup lang="ts">
import {
  useGameClient,
  useGameUi,
  useOpponentPlayer
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';

const player = useOpponentPlayer();
const ui = useGameUi();
const { client } = useGameClient();

const canAttack = computed(() => {
  return ui.value.selectedUnit?.canAttackPlayer ?? false;
});

const onMouseup = () => {
  if (!ui.value.selectedUnit) return;
  if (!canAttack.value) return;

  client.value.attack(ui.value.selectedUnit.id, null);
};
</script>

<template>
  <div class="opponent-hero-zone">
    <div class="zone" />
    <div class="zone" />
    <GameCard
      v-if="player?.hero"
      :card-id="player.hero.id"
      variant="small"
      show-stats
      show-modifiers
      :class="{ 'can-attack': canAttack }"
      @mouseup="onMouseup"
      @mouseenter="ui.hoverCardOnBoard(player.hero)"
      @mouseleave="ui.unhoverCardOnBoard()"
    />
    <div class="zone" />
    <div class="zone" />
  </div>
</template>

<style scoped lang="postcss">
.opponent-hero-zone {
  display: flex;
  gap: 15px;
}

.zone {
  width: 148px;
  height: 130px;
  background: url('@/assets/ui/board-small-card-slot-empty.png') no-repeat
    center;
}

.can-attack {
  filter: drop-shadow(0 0 6px red);
  transition: filter 0.2s var(--ease-2);
  &:hover {
    filter: drop-shadow(0 0 12px var(--red-5)) brightness(120%);
  }
}
</style>
