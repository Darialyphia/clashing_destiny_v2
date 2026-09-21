<script setup lang="ts">
import { AFFINITIES } from '@game/engine/src/card/card.enums';
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';

const { player } = defineProps<{ player: PlayerViewModel }>();

const orderedAffinities = computed(() => {
  const affinities = player.affinities;
  const ordered = [
    AFFINITIES.FIRE,
    AFFINITIES.WATER,
    AFFINITIES.EARTH,
    AFFINITIES.AIR,
    AFFINITIES.LIGHT,
    AFFINITIES.DARK,
    AFFINITIES.NEUTRAL
  ];
  return affinities.sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b));
});

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
    <div class="affinities" v-if="orderedAffinities.length > 0">
      <div
        v-for="(affinity, index) in orderedAffinities"
        :key="index"
        class="affinity"
        :data-affinity="affinity.toLocaleLowerCase()"
      />
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

.affinities {
  display: flex;
  gap: calc(2px * var(--pixel-scale));
  z-index: 1;
}

.affinity {
  width: calc(13px * var(--pixel-scale));
  height: calc(13px * var(--pixel-scale));
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  &[data-affinity='songhai'] {
    background-image: url('@/assets/ui/card/v3/affinity-songhai.png');
  }
  &[data-affinity='vanar'] {
    background-image: url('@/assets/ui/card/v3/affinity-vanar.png');
  }
  &[data-affinity='magmar'] {
    background-image: url('@/assets/ui/card/v3/affinity-magmar.png');
  }
  &[data-affinity='vetruvian'] {
    background-image: url('@/assets/ui/card/v3/affinity-vetruvian.png');
  }
  &[data-affinity='lyonar'] {
    background-image: url('@/assets/ui/card/v3/affinity-lyonar.png');
  }
  &[data-affinity='abyssian'] {
    background-image: url('@/assets/ui/card/v3/affinity-abyssian.png');
  }

  &[data-affinity='neutral'] {
    background-image: url('@/assets/ui/card/v3/affinity-neutral.png');
  }
}
</style>
