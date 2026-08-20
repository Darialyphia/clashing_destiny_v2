<script setup lang="ts"></script>

<template>
  <div class="foil foil-crt"></div>
</template>

<style scoped lang="postcss">
@keyframes crt-scanline-flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.92;
  }
}

.foil-crt {
  position: absolute;
  inset: 0;
  opacity: 1;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.25) 2px,
    rgba(0, 0, 0, 0.25) 4px
  );
  z-index: 10;
  animation: crt-scanline-flicker 0.08s steps(2) infinite;
}

:global(:is(.card-perspective-wrapper, .small-card):hover .foil-aurora-border) {
  opacity: 1;
  transition-delay: 0.3s;
}
</style>
