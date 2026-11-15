<script setup lang="ts">
import { isDefined } from '@game/shared';

const { manaSupply, exp } = defineProps<{
  manaSupply?: number | string | null;
  exp?: number | null;
}>();
</script>

<template>
  <div class="card-supply-exp parallax">
    <div class="value supply" :title="`Gives ${manaSupply} mana when supplied`">
      <span
        v-if="isDefined(manaSupply)"
        class="dual-text"
        :data-text="`+${manaSupply}`"
      >
        +{{ manaSupply }}
      </span>
    </div>
    <div
      class="value exp"
      :title="`Gives ${exp} EXP when banished from the supply`"
    >
      <span v-if="isDefined(exp)" class="dual-text" :data-text="`+${exp}`">
        +{{ exp }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="postcss">
/* the asset is 64x13: mana symbol then a slot for its value, a divider, then the exp star and its slot */
.card-supply-exp {
  position: absolute;
  bottom: calc(2px * var(--pixel-scale));
  left: calc(2px * var(--pixel-scale));
  width: calc(64px * var(--pixel-scale));
  height: calc(13px * var(--pixel-scale));
  z-index: 0;
  background-image: url('@/assets/ui/card-supply-exp.png');
  background-size: cover;
}

.value {
  position: absolute;
  top: 0;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: calc(var(--pixel-scale) * 9px);
  font-weight: var(--font-weight-9);
  line-height: 1;
}

.supply {
  left: calc(17px * var(--pixel-scale));
  width: calc(16px * var(--pixel-scale));
}

.exp {
  left: calc(49px * var(--pixel-scale));
  width: calc(13px * var(--pixel-scale));
}
</style>
