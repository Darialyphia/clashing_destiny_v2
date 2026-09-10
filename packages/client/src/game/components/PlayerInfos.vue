<script setup lang="ts">
import gsap from 'gsap';
import { useFxEvent, useGameClient } from '../composables/useGameClient';
import { preloadAsset } from '@/assets';
import DiscardPileModal from './DiscardPileModal.vue';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';

const { player, inverted } = defineProps<{
  player: PlayerViewModel;
  inverted?: boolean;
}>();

const { client } = useGameClient();

const isDiscardPileOpened = ref(false);
const displayedMana = ref(player.mana);

const openDiscardPileModal = () => {
  isDiscardPileOpened.value = true;
};

watch(
  () => player.mana,
  (value, previousValue) => {
    if (value === previousValue) return;

    gsap.to(displayedMana, {
      value,
      duration: 0.42,
      ease: 'power3.out',
      onUpdate: () => {
        displayedMana.value = Number(displayedMana.value.toFixed(0));
      }
    });
  },
  { immediate: true }
);

const hasInitiative = computed(() => {
  return client.value.getActivePlayerIds().includes(player.id);
});

useFxEvent(GAME_EVENTS.PLAYER_AFTER_MANA_CHANGE, event => {
  if (event.player === player.id) {
    player.update({ currentMana: player.mana + event.amount });
  }
});
</script>

<template>
  <div class="player-infos" :class="{ inverted }">
    <div class="relative" :class="{ 'has-initiative': hasInitiative }">
      <div>Todo player infos</div>
    </div>

    <DiscardPileModal v-model="isDiscardPileOpened" :player-id="player.id" />
  </div>
</template>

<style scoped lang="postcss">
.player-infos {
  z-index: 0;
  --drop-shadow: 0 4px #090d18;
  filter: drop-shadow(var(--drop-shadow));
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
  &.inverted {
    flex-direction: column-reverse;
  }
}

.mana {
  --pixel-scale: 2;
  width: calc(29px * var(--pixel-scale));
  height: calc(32px * var(--pixel-scale));
  background: url('@/assets/ui/card/v2/mana-cost-no-label.png');
  background-size: cover;
  margin-inline: auto;
  display: grid;
  place-items: center;
  -webkit-text-stroke: calc(3px * var(--pixel-scale)) black;
  paint-order: stroke fill;
  color: #e9d8c0;
  font-size: calc(var(--pixel-scale) * 16px);
  padding-bottom: calc(6px * var(--pixel-scale));
}

@property --initiative-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes initiative-rotate {
  from {
    --initiative-angle: 0deg;
  }
  to {
    --initiative-angle: 360deg;
  }
}

.has-initiative {
  &::after {
    content: '';
    position: absolute;
    mix-blend-mode: color-dodge;
    transition: opacity 0.3s ease-in-out;
    inset: 0;
    opacity: 1;
    background: conic-gradient(
      from var(--initiative-angle) at center,
      cyan,
      transparent,
      magenta,
      transparent,
      yellow,
      transparent,
      cyan
    );
    animation: initiative-rotate 6s linear infinite;
    clip-path: polygon(
      0% 0%,
      0% 100%,
      3% 100%,
      3% 3%,
      97% 3%,
      97% 97%,
      3% 97%,
      3% 100%,
      100% 100%,
      100% 0%
    );
  }
}
</style>
