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
  <div class="stats">
    <div class="stat commandment" v-if="isDefined(commandment)">
      <div class="stat-value" :data-text="commandment">
        {{ commandment }}
      </div>
    </div>
    <div class="stat atk" v-if="isDefined(atk)">
      <div class="stat-value" :data-text="atk">
        {{ atk }}
      </div>
    </div>
    <div class="stat hp" v-if="isDefined(hp)">
      <div class="stat-value" :data-text="hp">
        {{ hp }}
      </div>
    </div>
    <div class="stat durability" v-if="isDefined(durability)">
      <div class="stat-value" :data-text="durability">
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
  top: calc(75px * var(--pixel-scale));
  left: calc(5px * var(--pixel-scale));
}

.stat {
  position: relative;
  display: grid;
  place-items: center;
  padding-bottom: calc(2px * var(--pixel-scale));

  .stat-value {
    font-weight: var(--font-weight-7);
    font-size: calc(var(--pixel-scale) * 16px);
    color: #e9d8c0;
    -webkit-text-stroke: calc(3px * var(--pixel-scale)) black;
    paint-order: stroke fill;
  }
}

.commandment {
  width: calc(33px * var(--pixel-scale));
  height: calc(30px * var(--pixel-scale));
  background-image: url('@/assets/ui/card/v2/commandment.png');
  background-size: cover;
  padding-right: calc(4px * var(--pixel-scale));
}

.atk {
  width: calc(33px * var(--pixel-scale));
  height: calc(30px * var(--pixel-scale));
  background-image: url('@/assets/ui/card/v2/attack.png');
  background-size: cover;
  translate: calc(-2px * var(--pixel-scale)) 0;
}

.hp {
  width: calc(29px * var(--pixel-scale));
  height: calc(30px * var(--pixel-scale));
  background-image: url('@/assets/ui/card/v2/health.png');
  background-size: cover;
}

.durability {
  width: calc(29px * var(--pixel-scale));
  height: calc(30px * var(--pixel-scale));
  background-image: url('@/assets/ui/card/v2/durability.png');
  background-size: cover;
}
</style>
