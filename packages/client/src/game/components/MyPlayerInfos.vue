<script setup lang="ts">
import { useGameState, useMyPlayer } from '../composables/useGameClient';
import { assets, preloadAsset } from '@/assets';
const player = useMyPlayer();
const state = useGameState();

onMounted(() => {
  preloadAsset('ui/exp-bar-0');
  preloadAsset('ui/exp-bar-1');
  preloadAsset('ui/exp-bar-2');
  preloadAsset('ui/exp-bar-3');
  preloadAsset('ui/exp-bar-4');
  preloadAsset('ui/exp-bar-5');
});
</script>

<template>
  <div class="my-player-infos">
    <section class="left-side">
      <div class="avatar" />
      <div class="infos-bar">
        <div class="info-icon" :style="{ '--bg': assets['ui/deck'].css }" />
        {{ player.remainingCardsInDeck.length }}
        <div
          class="info-icon"
          :style="{ '--bg': assets['ui/discard-pile'].css }"
        />
        {{ player.discardPile.length }}
      </div>
    </section>

    <section>
      <div class="name dual-text" :data-text="player.name">
        {{ player.name }}
      </div>
      <div class="talent-bar">
        <div
          v-for="i in state.config.PLAYER_MAX_LEVEL"
          :key="i"
          class="talent"
        />
      </div>
      <div class="bottom-grid">
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
        <div class="health">
          <div class="dual-text" :data-text="player.currentHp">
            {{ player.currentHp }}
          </div>
        </div>
        <div class="exp">
          <div class="dual-text" :data-text="`${player.exp}EXP`">
            {{ player.exp }}EXP
          </div>

          <div
            class="exp-bar"
            :style="{ '--bg': assets[`ui/exp-bar-${player.exp}`].css }"
          />
        </div>
      </div>
    </section>
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
  padding-left: var(--size-4);
  display: flex;
  gap: 2px;
}

.mana {
  width: 21px;
  aspect-ratio: 1;
  background: var(--bg);
}

.talent-bar {
  display: flex;
  gap: 2px;
}

.talent {
  width: 48px;
  aspect-ratio: 1;
  background: url('@/assets/ui/talent-node.png');
}

.health {
  width: 47px;
  height: 43px;
  background: url('@/assets/ui/health.png');
  display: grid;
  place-content: center;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-9);
  z-index: 0;
  position: relative;
  grid-column: 2;
  grid-row: span 2;
  div {
    --dual-text-stroke-offset-y: -5px;
  }
}

.exp {
  display: flex;
  gap: 4px;
  align-items: start;
  --dual-text-stroke-offset-y: -6px;
  --dual-text-stroke: 1px;
  font-family: 'Lato', sans-serif;
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-9);
}

.exp-bar {
  width: 147px;
  height: 15px;
  background: var(--bg);
  margin-block-start: 4px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  translate: -25px 0;
  margin-block-start: 8px;
  row-gap: var(--size-2);
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
</style>
