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
@keyframes foil-gradient-opacity {
  from {
    opacity: var(--opacity-from);
  }
  to {
    opacity: var(--opacity-to);
  }
}

@keyframes foil-gradient-shift {
  50% {
    background-position: 100%;
  }
}
.foil-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: color-dodge;
  /* background: linear-gradient(
    45deg,
    rgb(255, 119, 115),
    rgba(255, 237, 95, 1),
    rgba(168, 255, 95, 1),
    rgba(131, 255, 247, 1),
    rgba(120, 148, 255, 1),
    rgb(216, 117, 255),
    rgb(255, 119, 115)
  ); */
  background: linear-gradient(
      125deg,
      #0000 0%,
      #ff008070 15%,
      #ffc80070 25%,
      #00ff8070 35%,
      #00c8ff70 45%,
      #8000ff70 55%,
      #ff008070 65%,
      #0000 100%
    )
    0 0/300% 300%;
  /* mask: var(--foil-mask); */
  mask-size: var(--foil-mask-size, cover);
  mask-position: var(--foil-mask-position, center);
  mask-repeat: no-repeat;
  opacity: 1;
  --opacity-from: 0.25;
  --opacity-to: 0.75;
  animation:
    foil-gradient 3s linear infinite,
    foil-gradient-shift 5s ease-in-out infinite,
    foil-gradient-opacity 3.5s ease-in-out infinite alternate;
}
</style>
