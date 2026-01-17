<script setup lang="ts"></script>

<template>
  <div class="card-back" />
</template>

<style scoped lang="postcss">
.card-back {
  background: url('@/assets/ui/card/card_backs/default.png') no-repeat center;
  background-size: cover;
  aspect-ratio: var(--card-ratio);
  height: calc(var(--card-height) * var(--pixel-scale));
}
</style>
