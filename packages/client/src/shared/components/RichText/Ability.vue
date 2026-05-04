<script setup lang="ts">
const { cost } = defineProps<{
  cost: number;
}>();
</script>

<template>
  <span class="ability">
    <rt-mana v-if="cost > 0" class="mana">{{ cost }}</rt-mana>
    Ability
  </span>
</template>

<style scoped lang="postcss">
.ability {
  background: linear-gradient(to bottom, var(--gray-8) 50%, var(--gray-11) 50%);
  color: white;
  padding: calc(1px * var(--pixel-scale)) calc(2px * var(--pixel-scale));
  display: inline-flex;
  align-items: center;
  clip-path: polygon(
    calc(3px * var(--pixel-scale)) 0,
    calc(100% - 3px * var(--pixel-scale)) 0,
    100% 50%,
    calc(100% - 3px * var(--pixel-scale)) 100%,
    calc(3px * var(--pixel-scale)) 100%,
    0 50%
  );
  font-weight: 500;
  font-family: var(--font-system-ui);
  font-size: 0.9em;

  .mana {
    translate: 0 0;
  }
}
</style>
