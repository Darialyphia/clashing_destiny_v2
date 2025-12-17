<script setup lang="ts"></script>

<template>
  <div class="foil foil-gradient" />
</template>

<style scoped lang="postcss">
@keyframes foil-gradient {
  to {
    filter: hue-rotate(360deg);
  }
}
@keyframes foil-opacity {
  from {
    opacity: var(--opacity-from);
  }
  to {
    opacity: var(--opacity-to);
  }
}
.foil-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: multiply;
  background: linear-gradient(
    135deg,
    rgb(255, 119, 115),
    rgba(255, 237, 95, 1),
    rgba(168, 255, 95, 1),
    rgba(131, 255, 247, 1),
    rgba(120, 148, 255, 1),
    rgb(216, 117, 255),
    rgb(255, 119, 115)
  );
  mask: var(--foil-mask) center/cover no-repeat;
  opacity: 1;
  --opacity-from: 0.25;
  --opacity-to: 0.5;
  animation:
    foil-gradient 5s linear infinite,
    foil-opacity 3s linear alternate infinite;
}
</style>
