<script setup lang="ts"></script>

<template>
  <div class="foil foil-gold" />
</template>

<style scoped lang="postcss">
@keyframes foil-golden-glare {
  from {
    opacity: var(--opacity-from);
  }
  to {
    opacity: var(--opacity-to);
  }
}
.foil-gold {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at var(--glare-x) var(--glare-y),
      hsla(45, 100%, 60%, 0.8) 5%,
      hsla(45, 100%, 60%, 0.65) 12%,
      hsla(0, 0%, 0%, 0.5) 90%
    ),
    linear-gradient(orange, gold);
  mix-blend-mode: plus-lighter;
  background-blend-mode: hard-light;
  mask: var(--foil-mask);
  mask-size: var(--foil-mask-size, cover);
  mask-position: var(--foil-mask-position, center);
  mask-repeat: no-repeat;
  opacity: 0.5;
  --opacity-from: 0;
  --opacity-to: 0.25;
  animation: foil-golden-glare 3.5s linear alternate infinite;
}
</style>
