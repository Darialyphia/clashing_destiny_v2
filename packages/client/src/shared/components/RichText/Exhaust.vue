<script setup lang="ts"></script>

<template>
  <span class="exhaust" />
</template>

<style scoped lang="postcss">
.exhaust {
  display: inline-block;
  background: url(@/assets/ui/ability-exhaust.png) no-repeat center center;
  background-size: cover;
  width: calc(20px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));

  translate: 0 calc(3px * var(--pixel-scale));
}
</style>
