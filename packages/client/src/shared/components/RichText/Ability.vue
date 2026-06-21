<script setup lang="ts">
const { cost, exhaust } = defineProps<{
  cost: number;
  exhaust: boolean;
}>();
</script>

<template>
  <span class="ability">
    <rt-exhaust v-if="exhaust" class="exhaust" />
    <rt-mana v-if="cost > 0" class="mana">{{ cost }}</rt-mana>
    :
  </span>
</template>

<style scoped lang="postcss">
.ability {
  /* padding: calc(1px * var(--pixel-scale)) calc(2px * var(--pixel-scale));
  display: inline-flex;
  align-items: center;

  font-weight: 500;
  font-family: var(--font-system-ui);
  font-size: 0.9em; */

  .mana {
    translate: 0 0;
  }
}
</style>
