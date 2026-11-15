<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import FancyButton from '@/ui/components/FancyButton.vue';
import { useGameUi, useMyPlayer } from '../composables/useGameClient';

const { player } = defineProps<{ player: PlayerViewModel }>();

const ui = useGameUi();
const myPlayer = useMyPlayer();

const isMaxLevel = computed(() => player.expToNextLevel === null);

const progress = computed(() => {
  if (player.expToNextLevel === null) return 1;
  return Math.min(1, player.exp / player.expToNextLevel);
});

const expLabel = computed(() =>
  player.expToNextLevel === null
    ? 'MAX'
    : `${player.exp}/${player.expToNextLevel} EXP`
);

// only the local player gets the button, the engine decides when it's displayed and enabled
const levelUpAction = computed(() => {
  if (!myPlayer.value.equals(player)) return null;
  return ui.value.globalActions.find(action => action.id === 'levelUp') ?? null;
});
</script>

<template>
  <div
    v-if="ui.displayedElements.playerLevel"
    class="player-level"
    :id="ui.DOMSelectors.playerLevel(player.id).id"
  >
    <div class="level-badge" :title="`Level ${player.level}`">
      <div class="level-star" v-for="i in player.level" :key="i" />
    </div>

    <div class="exp">
      <div class="exp-bar" :class="{ max: isMaxLevel }">
        <div class="exp-fill" :style="{ '--progress': progress }" />
      </div>
      <span class="exp-text">{{ expLabel }}</span>
    </div>

    <FancyButton
      v-if="levelUpAction"
      class="level-up-button"
      size="sm"
      :variant="levelUpAction.variant"
      :text="levelUpAction.label"
      :disabled="levelUpAction.isDisabled"
      @click="levelUpAction.onClick()"
    />
  </div>
</template>

<style scoped lang="postcss">
.player-level {
  display: grid;
  grid-template-rows: auto auto;
  gap: var(--size-2);
}

.level-badge {
  display: flex;
  gap: var(--size-1);
}

.level-star {
  width: 39px;
  aspect-ratio: 1;
  background: url('@/assets/ui/card-level-filled.png') no-repeat center center;
  background-size: cover;
}

.exp {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exp-bar {
  width: 96px;
  height: 10px;
  background: #1a1326;
  border: solid 2px #000;
  box-shadow: 0 0 0 1px #d9a441;
  .exp-fill {
    height: 100%;
    width: calc(var(--progress) * 100%);
    background: linear-gradient(#9be7ff, #3fa7d6);
    transition: width 0.4s var(--ease-2);
  }
  &.max .exp-fill {
    background: linear-gradient(#ffe48a, #d9a441);
  }
}

.exp-text {
  font-size: 13px;
  font-weight: var(--font-weight-7);
  color: #f8eabb;
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
}

.level-up-button {
  animation: level-up-pulse 1.2s ease-in-out infinite;
  &:disabled {
    animation: none;
  }
}

@keyframes level-up-pulse {
  50% {
    filter: brightness(1.25) drop-shadow(0 0 8px #9be7ff);
  }
}
</style>
