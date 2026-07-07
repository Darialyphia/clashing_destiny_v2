<script setup lang="ts"></script>

<template>
  <span class="exhaust" />
</template>

<style scoped lang="postcss">
.exhaust {
  display: inline-block;
  background: url(@/assets/ui/ability-exhaust.png) no-repeat center center;
  background-size: cover;
  width: calc(20px * var(--pixel-scale) / 2);
  height: calc(20px * var(--pixel-scale) / 2);

  translate: 0 calc(1px * var(--pixel-scale));
}
</style>
