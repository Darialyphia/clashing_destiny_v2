<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import {
  useFxEvent,
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { until } from '@vueuse/core';
import { useHeroDragSelection } from '../composables/useHeroDragSelection';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import Arrow from './Arrow.vue';
import { useHeroArrowPath } from '../composables/useHeroArrowPath';
import AbilityMenu from './AbilityMenu.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const ui = useGameUi();
const state = useGameState();
const { client, playerId } = useGameClient();
const { heroPath, pathColor } = useHeroArrowPath(player.hero!);

const canBeAttacked = computed(() => {
  if (isOwnHero.value) return false;
  if (ui.value.selectedUnit) {
    return ui.value.selectedUnit.canAttackPlayer;
  }
  if (ui.value.selectedHero) {
    return player.canAttackPlayer;
  }
  return false;
});

const isTakingDamage = ref(false);
useFxEvent(FX_EVENTS.COMBAT_BEFORE_RECEIVE_DAMAGE, async event => {
  if (event.target !== player.id) return;
  const heroEl = ui.value.DOMSelectors.hero(player.id).element;
  if (!heroEl) return;
  isTakingDamage.value = true;
  heroEl.addEventListener(
    'animationend',
    () => {
      isTakingDamage.value = false;
    },
    { once: true }
  );

  await until(isTakingDamage).toBe(false);
});

const isOwnHero = computed(() => playerId.value === player.id);

const canSelectHero = computed(() => {
  if (!isOwnHero.value) return false;
  if (!ui.value.isInteractivePlayer) return false;
  if (state.value.phase.state !== GAME_PHASES.MAIN) return false;
  if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
  return !player.isExhausted && player.canAttack;
});

const dragSelection = useHeroDragSelection(
  computed(() => player.hero!),
  canSelectHero
);

const isAbilityMenuOpened = ref(false);
const handleAbilities = () => {
  if (!player.hero) return;

  const availableAbilities = player.hero.abilityActions;
  if (availableAbilities.length === 1) {
    return availableAbilities[0].handler(player.hero);
  }
  if (availableAbilities.length > 1) {
    isAbilityMenuOpened.value = true;
  }
};

const handleOwnHeroMouseup = () => {
  const shouldHandleAbilities = !ui.value.selectedHero?.equals(player.hero!);
  if (shouldHandleAbilities) {
    handleAbilities();
  } else {
    dragSelection.onMouseup();
  }
};

const handleOpponentHeroMouseup = () => {
  if (!canBeAttacked.value) return;

  if (ui.value.selectedUnit) {
    client.value.attack(ui.value.selectedUnit.id, null);
    return;
  }
  if (ui.value.selectedHero) {
    client.value.attack(null, null);
  }
};

const handleMouseup = (e: MouseEvent) => {
  if (e.button !== 0) return;
  if (isOwnHero.value) {
    return handleOwnHeroMouseup();
  } else {
    return handleOpponentHeroMouseup();
  }
};

const handleMousedown = (e: MouseEvent) => {
  if (e.button !== 0) return;
  if (!isOwnHero.value) return;
  dragSelection.onMousedown(e);
};

const isSelected = computed(() => {
  if (!ui.value.selectedHero) return false;
  return ui.value.selectedHero.id === player.hero?.id;
});
</script>

<template>
  <div
    v-if="player?.hero"
    :id="ui.DOMSelectors.hero(player.id).id"
    class="hero"
    :class="{
      'can-attack': canBeAttacked,
      'is-taking-damage': isTakingDamage,
      'is-selected': isSelected,
      'is-exhausted': player.isExhausted
    }"
    @mouseup.stop="handleMouseup"
    @mousedown="handleMousedown"
    @mouseenter="ui.hoverCardOnBoard(player.hero)"
    @mouseleave="ui.unhoverCardOnBoard()"
  >
    <AbilityMenu
      :card="player.hero"
      v-model:isOpened="isAbilityMenuOpened"
      actions-side="top"
      use-portal
    >
      <GameCard
        :card-id="player.hero.id"
        variant="small"
        show-stats
        show-modifiers
      />
    </AbilityMenu>

    <Teleport to="#arrows" defer>
      <Arrow v-if="heroPath" :path="heroPath" :color="pathColor" />
    </Teleport>
  </div>
</template>

<style scoped lang="postcss">
.hero {
  transition: all 0.3s var(--ease-2);
}

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

.is-selected {
  translate: 0 -6px;
  box-shadow: 0 6px 30px 4px black;
}

.is-exhausted {
  filter: grayscale(35%) brightness(50%);
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
