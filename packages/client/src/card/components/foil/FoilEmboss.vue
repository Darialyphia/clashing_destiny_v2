<script setup lang="ts"></script>

<template>
  <div class="foil foil-emboss" />
</template>

<style scoped lang="postcss">
@keyframes foil-glitter {
  from {
    filter: hue-rotate(0deg);
  }
  to {
    filter: hue-rotate(360deg);
  }
}
.foil {
  --red: hsla(348, 100%, 57%, 0.4);
  --yellow: hsla(50, 100%, 57%, 0.4);
  --green: hsla(150, 100%, 57%, 0.4);
  --blue: hsla(195, 100%, 57%, 0.4);
  --violet: hsla(288, 100%, 57%, 0.4);
}
.foil-emboss {
  --glitter: url('@/assets/fx/texture.png');
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(
      110deg,
      var(--violet),
      var(--blue),
      var(--green),
      var(--yellow),
      var(--red),
      var(--violet),
      var(--blue),
      var(--green),
      var(--yellow),
      var(--red),
      var(--violet),
      var(--blue),
      var(--green),
      var(--yellow),
      var(--red)
    ),
    var(--glitter), var(--glitter),
    radial-gradient(
      farthest-corner circle at var(--glare-x) var(--glare-y),
      hsla(0, 0%, 95%, 0.98) 10%,
      hsla(177, 22%, 80%, 0.1) 20%,
      hsla(150, 20%, 10%, 1) 90%
    );
  mix-blend-mode: color-dodge;
  background-size: cover, cover, cover, cover;
  background-position:
    center center,
    center center,
    center center,
    center center;
  background-blend-mode: overlay, soft-light, color-burn;
  /* mask: var(--art-mask), linear-gradient(#000 0 0);
  mask-size:
    calc(var(--card-v2-art-frame-width) * var(--pixel-scale) * 2),
    calc(var(--card-v2-art-frame-height) * var(--pixel-scale) * 2);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  mask-position: var(--art-mask-position, center), center;
  mask-repeat: no-repeat, repeat; */
  mask-image: var(--foil-mask);
  transition: opacity 0.5s;
  opacity: 0;
  animation: foil-glitter 2.5s linear infinite;
}

:global(:is(.card-perspective-wrapper, .small-card):hover .foil-emboss) {
  opacity: 0.2;
  transition-delay: 0.3s;
}
</style>
