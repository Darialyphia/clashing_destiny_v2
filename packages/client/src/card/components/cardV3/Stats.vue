<script setup lang="ts">
import { isDefined } from '@game/shared';

const {} = defineProps<{
  atk: number | null;
  hp: number | null;
  commandment: number | null;
  durability: number | null;
}>();
</script>

<template>
  <div
    class="stats parallax"
    style="--dual-text-stroke-offset-y: calc(-2px * var(--pixel-scale))"
  >
    <div class="stat commandment" v-if="isDefined(commandment)">
      <div class="stat-value dual-text" :data-text="commandment">
        {{ commandment }}
      </div>
    </div>
    <div class="stat atk" v-if="isDefined(atk)">
      <div class="stat-value dual-text" :data-text="atk">
        {{ atk }}
      </div>
    </div>
    <div class="stat hp" v-if="isDefined(hp)">
      <div class="stat-value dual-text" :data-text="hp">
        {{ hp }}
      </div>
    </div>
    <div class="stat durability" v-if="isDefined(durability)">
      <div class="stat-value dual-text" :data-text="durability">
        {{ durability }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.stats {
  display: flex;
  flex-direction: column;
  gap: calc(2px * var(--pixel-scale));
  position: absolute;
  top: calc(28px * var(--pixel-scale));
  right: calc(2px * var(--pixel-scale));
}

.stat {
  position: relative;
  display: grid;
  place-items: center;
  padding-top: calc(2px * var(--pixel-scale));
  padding-left: calc(10px * var(--pixel-scale));
  width: calc(32px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  z-index: 0;

  .stat-value {
    font-weight: var(--font-weight-9);
    font-size: calc(var(--pixel-scale) * 13px);
    color: transpaarent;
  }
}

.commandment {
  background-image: url('@/assets/ui/card/v3/commandment.png');
  background-size: cover;
}

.atk {
  background-image: url('@/assets/ui/card/v3/attack.png');
  background-size: cover;
}

.hp {
  background-image: url('@/assets/ui/card/v3/health.png');
  background-size: cover;
}

.durability {
  background-image: url('@/assets/ui/card/v3/durability.png');
  background-size: cover;
}
</style>
