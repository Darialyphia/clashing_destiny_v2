<script setup lang="ts"></script>

<template>
  <div class="small-card-back" />
</template>

<style scoped lang="postcss">
.small-card-back {
  background: url('/assets/ui/card-back-small.png') no-repeat center center;
  background-size: cover;
  aspect-ratio: var(--card-small-ratio);
  width: calc(var(--pixel-scale) * var(--card-small-width));
}
</style>
