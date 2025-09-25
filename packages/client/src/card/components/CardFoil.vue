<script setup lang="ts"></script>

<template>
  <div class="foil" />
  <div class="foil-oil" />
</template>

<style scoped lang="postcss">
@property --foil-x {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}
@property --foil-y {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
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

.foil {
  --space: 5%;
  --angle: 133deg;
  --foil-brightness: 0.6;
  position: absolute;
  inset: 0;
  opacity: 0.3;
  pointer-events: none;
  mask-image: var(--foil-mask);
  mask-size: cover;
  mix-blend-mode: color-dodge;
  background-image:
    url('/assets/ui/foil-texture.webp'),
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

.foil-oil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: color-dodge;
  opacity: 0;
  background:
    radial-gradient(
      120% 80% at var(--foil-oil-x) var(--foil-oil-y),
      #fff8 0%,
      #fff2 40%,
      #0000 60%
    ),
    conic-gradient(
      from 0deg at var(--foil-oil-x) var(--foil-oil-y),
      #ff7 0deg,
      #a8ff5f 60deg,
      #83fff7 120deg,
      #7894ff 180deg,
      #d875ff 240deg,
      #ff7773 300deg,
      #ff7 360deg
    );
  background-blend-mode: screen, hard-light;
  filter: saturate(1.6) contrast(1.2);
  mask: var(--foil-mask) center/cover no-repeat;
  transition: opacity 1s;
  transition-delay: 0;
  :has(> &):hover & {
    opacity: 0.12;
    transition-delay: 0.5s;
  }
}
</style>
