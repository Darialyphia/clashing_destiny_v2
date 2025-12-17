<script setup lang="ts"></script>

<template>
  <div class="foil foil-sheen" />
</template>

<style scoped lang="postcss">
.foil {
  --red: #f80e35;
  --yellow: #eedf10;
  --green: #21e985;
  --blue: #0dbde9;
  --violet: #c929f1;
}

@property --foil-brightness {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

@keyframes foil-move {
  from {
    --foil-x: var(--foil-animated-toggle) 0%;
    --foil-y: var(--foil-animated-toggle) 0%;
  }
  to {
    --foil-x: var(--foil-animated-toggle) 37.9%;
    --foil-y: var(--foil-animated-toggle) 100%;
  }
}

@keyframes foil-brightness {
  from {
    --foil-brightness: 0.2;
  }
  50% {
    --foil-brightness: 0.5;
  }
  to {
    --foil-brightness: 0.2;
  }
}

.foil-sheen {
  --space: 5%;
  --angle: 133deg;
  --foil-brightness: 0.6;
  position: absolute;
  inset: 0;
  opacity: 0.25;
  pointer-events: none;
  mask-image: var(--foil-mask);
  mask-size: cover;
  mix-blend-mode: color-dodge;
  background-image:
    linear-gradient(white, white),
    repeating-linear-gradient(
      0deg,
      rgb(255, 119, 115) calc(var(--space) * 1),
      rgba(255, 237, 95, 1) calc(var(--space) * 2),
      rgba(168, 255, 95, 1) calc(var(--space) * 3),
      rgba(131, 255, 247, 1) calc(var(--space) * 4),
      rgba(120, 148, 255, 1) calc(var(--space) * 5),
      rgb(216, 117, 255) calc(var(--space) * 6),
      rgb(255, 119, 115) calc(var(--space) * 7)
    ),
    repeating-linear-gradient(
      var(--angle),
      #0e152e 0%,
      hsl(180, 10%, 60%) 3.8%,
      hsl(180, 29%, 66%) 4.5%,
      hsl(180, 10%, 60%) 5.2%,
      #0e152e 10%,
      #0e152e 12%
    );
  /* url('/assets/ui/foil-texture.webp'); */
  background-size:
    40%,
    200% 700%,
    500%;
  background-repeat: repeat, no-repeat, no-repeat;
  background-blend-mode: exclusion, hue, hard-light;
  background-position:
    center,
    0% var(--foil-y),
    var(--foil-x) var(--foil-y);
  filter: brightness(calc((var(--foil-brightness) * 0.3) + 0.5)) contrast(5)
    saturate(1.5);
  animation:
    foil-move 10s infinite linear,
    foil-brightness 5s infinite ease-in-out;
}
</style>
