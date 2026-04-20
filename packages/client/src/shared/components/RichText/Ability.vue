<script setup lang="ts">
const { cost } = defineProps<{
  cost: number;
}>();
</script>

<template>
  <span class="ability">
    <rt-mana v-if="cost > 0">{{ cost }}</rt-mana>
    Ability
  </span>
</template>

<style scoped lang="postcss">
.ability {
  background: linear-gradient(to bottom, var(--gray-8) 50%, var(--gray-11) 50%);
  color: white;
  padding-inline: calc(2px * var(--pixel-scale));
  clip-path: polygon(
    calc(3px * var(--pixel-scale)) 0,
    calc(100% - 3px * var(--pixel-scale)) 0,
    100% 50%,
    calc(100% - 3px * var(--pixel-scale)) 100%,
    calc(3px * var(--pixel-scale)) 100%,
    0 50%
  );
  font-weight: 500;
}
</style>
