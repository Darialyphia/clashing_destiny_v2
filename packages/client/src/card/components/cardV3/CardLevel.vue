<script setup lang="ts">
const { level } = defineProps<{
  level: number;
}>();
</script>

<template>
  <div class="card-level parallax" :title="`Requires level ${level}`">
    <div v-for="i in level" :key="i" class="star" />
  </div>
</template>

<style scoped lang="postcss">
/* one star per level, right of the mana cost */
.card-level {
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  left: calc(32px * var(--pixel-scale));
  z-index: 0;
  display: flex;
  gap: calc(1px * var(--pixel-scale));
}

.star {
  width: calc(13px * var(--pixel-scale));
  height: calc(13px * var(--pixel-scale));
  background-image: url('@/assets/ui/card-level-filled.png');
  background-size: cover;
}
</style>
