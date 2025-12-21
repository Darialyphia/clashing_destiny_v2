<script setup lang="ts"></script>

<template>
  <div class="foil foil-oil" />
</template>

<style scoped lang="postcss">
.foil {
  --red: #f80e35;
  --yellow: #eedf10;
  --green: #21e985;
  --blue: #0dbde9;
  --violet: #c929f1;
}

@keyframes foil-oil {
  from {
    filter: saturate(1.6) contrast(1.2);
  }
  to {
    filter: saturate(1.6) contrast(1.2) hue-rotate(360deg);
  }
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
  mask: var(--foil-mask);
  mask-size: var(--foil-mask-size, cover);
  mask-position: var(--foil-mask-position, center);
  mask-repeat: no-repeat;
  transition: opacity 1s;
  transition-delay: 0;
  animation: foil-oil 5s linear infinite;
}

:global(:is(.card-perspective-wrapper, .small-card):hover .foil-oil) {
  opacity: 0.15;
  transition-delay: 0.3s;
}
</style>
