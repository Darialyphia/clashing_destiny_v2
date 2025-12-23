<script setup lang="ts">
import { uiAssets } from '@/assets';
</script>

<template>
  <div class="card-back" />
</template>

<style scoped lang="postcss">
.card-back {
  background: v-bind('uiAssets.card.back.css') no-repeat center center;
  background-size: cover;
  aspect-ratio: var(--card-ratio);
  height: calc(var(--card-height) * var(--pixel-scale));
}
</style>
