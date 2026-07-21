<script setup lang="ts"></script>

<template>
  <span class="mana"><slot /></span>
</template>

<style scoped lang="postcss">
.mana {
  background: url('@/assets/ui/mana-cost.png') no-repeat center center;
  background-size: cover;
  font-weight: var(--font-weight-5);
  border-radius: var(--radius-round);
  width: calc(20px * var(--pixel-scale));
  height: calc(18px * var(--pixel-scale));
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 1px;
  color: white;
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
  translate: 0 calc(-1px * var(--pixel-scale));
}
</style>
