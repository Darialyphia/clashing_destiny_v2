<script setup lang="ts">
import { useFxEvent, useGameClient } from '../composables/useGameClient';
import { assets, preloadAsset } from '@/assets';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import DiscardPileModal from './DiscardPileModal.vue';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const { client } = useGameClient();

const isDiscardPileOpened = ref(false);

const openDiscardPileModal = () => {
  isDiscardPileOpened.value = true;
};

onMounted(() => {
  preloadAsset('ui/exp-bar-0');
  preloadAsset('ui/exp-bar-1');
  preloadAsset('ui/exp-bar-2');
  preloadAsset('ui/exp-bar-3');
  preloadAsset('ui/exp-bar-4');
  preloadAsset('ui/exp-bar-5');
});

const hasInitiative = computed(() => {
  return player.id === client.value.getActivePlayerId();
});

useFxEvent(GAME_EVENTS.PLAYER_AFTER_MANA_CHANGE, event => {
  if (event.player === player.id) {
    player.update({ currentMana: player.mana + event.amount });
  }
});
</script>

<template>
  <div class="my-player-infos">
    <section class="left-side">
      <div class="avatar" :class="{ 'has-initiative': hasInitiative }" />
      <div class="infos-bar">
        <div class="info-icon" :style="{ '--bg': assets['ui/deck'].css }" />
        {{ player.remainingCardsInMainDeck }}
        <UiSimpleTooltip>
          <template #trigger>
            <button class="discard-pile-btn" @click="openDiscardPileModal">
              <div
                class="info-icon"
                :style="{ '--bg': assets['ui/discard-pile'].css }"
              />
              {{ player.discardPile.length }}
            </button>
          </template>
          Your discard pile
        </UiSimpleTooltip>
      </div>
    </section>

    <section>
      <div class="name dual-text" :data-text="player.name">
        {{ player.name }}
      </div>
      <div class="bottom">
        <div class="mana-bar">
          <div
            v-for="i in player.maxMana"
            :key="i"
            class="mana"
            :style="{
              '--bg':
                player.mana >= i
                  ? assets['ui/mana-filled'].css
                  : assets['ui/mana-empty'].css
            }"
          />
        </div>

        <div class="flex gap-2">
          <div class="rune might">
            <span class="dual-text" :data-text="player.runes.might">
              {{ player.runes.might }}
            </span>
          </div>
          <div class="rune wisdom">
            <span class="dual-text" :data-text="player.runes.wisdom">
              {{ player.runes.wisdom }}
            </span>
          </div>
          <div class="rune focus">
            <span class="dual-text" :data-text="player.runes.focus">
              {{ player.runes.focus }}
            </span>
          </div>
          <div class="rune resonance">
            <span class="dual-text" :data-text="player.runes.resonance">
              {{ player.runes.resonance }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <DiscardPileModal v-model="isDiscardPileOpened" :player-id="player.id" />
  </div>
</template>

<style scoped lang="postcss">
.my-player-infos {
  z-index: 0;
  --drop-shadow: 0 4px #090d18;
  filter: drop-shadow(var(--drop-shadow));
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: var(--size-1);
  background-color: hsl(0 0% 0% / 0.35);
  padding: var(--size-2) var(--size-4) 0;
  border-radius: var(--radius-3);
}

.left-side {
  grid-column: 1;
  grid-row: 1 / -1;
  align-self: start;
  translate: 0 -6px;
}

.avatar {
  width: 94px;
  aspect-ratio: 1;
  background: url('@/assets/avatars/erina.png');
  background-size: cover;
  margin-block-start: var(--size-3);
}

.name {
  --dual-text-stroke: 1px;
  font-family: 'Lato', sans-serif;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-9);
  line-height: 1.1;
}

.mana-bar {
  display: flex;
  gap: 4px;
}

.mana {
  width: 21px;
  aspect-ratio: 1;
  background: var(--bg);
}

.bottom {
  margin-block-start: 8px;
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.infos-bar {
  width: 86px;
  height: 24px;
  background: url('@/assets/ui/player-info-bar.png');
  translate: 0 -14px;
  color: #f8eabb;
  display: flex;
  gap: var(--size-1);
  align-items: center;
  justify-content: center;
}

.info-icon {
  width: 16px;
  height: 15px;
  background: var(--bg);
}

.discard-pile-btn {
  all: unset;
  display: flex;
  align-items: center;
  gap: var(--size-1);
  cursor: pointer;

  &:hover {
    filter: brightness(1.3);
  }
}

.has-initiative {
  filter: drop-shadow(0 0 10px var(--yellow-2)) brightness(125%);
}

.rune {
  background-position: top center;
  background-size: 29px 30px;
  background-repeat: no-repeat;
  padding-top: 32px;
  min-width: 29px;
  text-align: center;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-7);
  position: relative;
  z-index: 0;
  --dual-text-stroke-offset-y: -3px;
  &.might {
    background-image: url('@/assets/ui/card/rune-might-large.png');
  }
  &.wisdom {
    background-image: url('@/assets/ui/card/rune-wisdom-large.png');
  }
  &.focus {
    background-image: url('@/assets/ui/card/rune-focus-large.png');
  }
  &.resonance {
    background-image: url('@/assets/ui/card/rune-resonance-large.png');
  }
}
</style>
