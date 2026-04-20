<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import {
  useFxEvent,
  useGameClient,
  useGameUi
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { until } from '@vueuse/core';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();
const ui = useGameUi();
const { client, playerId } = useGameClient();

const canAttack = computed(() => {
  return ui.value.selectedUnit?.canAttackPlayer ?? false;
});

const onMouseup = (e: MouseEvent) => {
  if (e.button !== 0) return;
  if (playerId.value === player.id) return;
  if (!ui.value.selectedUnit) return;
  if (!canAttack.value) return;

  client.value.attack(ui.value.selectedUnit.id, null);
};

const isTakingDamage = ref(false);
const heroEl = useTemplateRef('hero');
useFxEvent(FX_EVENTS.COMBAT_BEFORE_RECEIVE_DAMAGE, async event => {
  if (event.target !== player.id) return;
  console.log('hero taking damage', event);
  if (!heroEl.value) return;
  console.log('starting hero damage animation');
  isTakingDamage.value = true;
  heroEl.value.addEventListener(
    'animationend',
    () => {
      isTakingDamage.value = false;
    },
    { once: true }
  );

  await until(isTakingDamage).toBe(false);
});
</script>

<template>
  <div
    v-if="player?.hero"
    class="hero"
    ref="hero"
    :class="{ 'can-attack': canAttack, 'is-taking-damage': isTakingDamage }"
    @mouseup.stop="onMouseup"
    @mouseenter="ui.hoverCardOnBoard(player.hero)"
    @mouseleave="ui.unhoverCardOnBoard()"
  >
    <GameCard
      :card-id="player.hero.id"
      variant="small"
      show-stats
      show-modifiers
    />
  </div>
</template>

<style scoped lang="postcss">
.can-attack {
  filter: drop-shadow(0 0 6px red);
  transition: filter 0.2s var(--ease-2);
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: red;
    opacity: 0.5;
    mix-blend-mode: multiply;
    transition: opacirt 0.2s var(--ease-2);
    mask-image: url('@/assets/ui/board-small-card-slot.png');
    mask-size: cover;
  }
  &:hover {
    filter: drop-shadow(0 0 12px var(--red-5)) brightness(120%);
    &::after {
      opacity: 0.35;
    }
  }
}

.is-taking-damage {
  animation:
    hero-take-damage 0.3s ease-in-out,
    hero-take-damage-shake 0.3s linear;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: red;
    opacity: 0.8;
    mix-blend-mode: multiply;
    pointer-events: none;
  }
}

@keyframes hero-take-damage {
  50% {
    filter: sepia(100%) hue-rotate(-40deg) brightness(75%) saturate(180%)
      drop-shadow(0 0 10px red);
  }
}

@keyframes hero-take-damage-shake {
  0%,
  100% {
    transform: none;
  }
  20%,
  60% {
    transform: translateX(-5px);
  }
  40%,
  80% {
    transform: translateX(5px);
  }
}
</style>
