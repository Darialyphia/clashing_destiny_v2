<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';

const { player } = defineProps<{ player: PlayerViewModel }>();

const displayedMana = ref(player.mana);

watch(
  () => player.mana,
  (value, previousValue) => {
    if (value === previousValue) return;

    gsap.to(displayedMana, {
      value,
      duration: 0.4,
      ease: Power3.easeOut,
      onUpdate: () => {
        displayedMana.value = Number(displayedMana.value.toFixed(0));
      }
    });
  },
  { immediate: true }
);
</script>

<template>
  <div class="player-resources">
    <div class="mana">
      <div
        class="dual-text"
        :data-text="`${displayedMana} / ${player.maxMana}`"
      >
        {{ displayedMana }} / {{ player.maxMana }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.player-resources {
  line-height: 1.2;
}
.mana {
  position: relative;
  z-index: 0;
  background: url(@/assets/ui/card/v3/mana-cost.png) no-repeat;
  background-position: center left;
  padding-left: 40px;
  font-weight: var(--font-weight-9);
  font-size: var(--font-size-5);
}
</style>
