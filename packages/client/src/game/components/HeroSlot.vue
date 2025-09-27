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
    <div
      class="hero-hp"
      :style="{ '--percentage': (hero.hp! / hero.maxHp!) * 100 }"
    >
      {{ hero.hp }} / {{ hero.maxHp }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
.hero-slot {
  position: relative;
}

.hero-hp {
  position: absolute;
  bottom: calc(-1 * var(--size-1));
  right: 0;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-8);
  color: white;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  text-shadow: var(--text-shadow-heavy);
  z-index: 0;
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 64px;
    height: 64px;
    border-radius: var(--radius-round);
    aspect-ratio: 1;
    background: url('/assets/ui/hero-hp-filled.png');
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center bottom;
    z-index: -1;
    transform: translateX(-50%) translateY(-50%);
    border: solid 3px black;
    mask: linear-gradient(
      to top,
      black calc(var(--percentage) * 1%),
      transparent calc(var(--percentage) * 1%)
    );
  }
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 64px;
    height: 64px;
    border-radius: var(--radius-round);
    border: solid 3px black;
    aspect-ratio: 1;
    background-color: #32021b;
    z-index: -1;
    transform: translateX(-50%) translateY(-50%);

    box-shadow: inset 0 0 0 3px #5d1529;
  }
}
</style>
