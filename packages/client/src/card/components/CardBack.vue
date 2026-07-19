<script setup lang="ts"></script>

<template>
  <div class="card-back" />
</template>

<style scoped lang="postcss">
.card-back {
  background: url('@/assets/ui/card/v2/card-back.png') no-repeat center;
  background-size: cover;
  aspect-ratio: var(--card-v2-ratio);
  height: calc(var(--card-v2-height) * var(--pixel-scale));
}
</style>
