<script setup lang="ts"></script>

<template>
  <div class="foil foil-scanlines" />
</template>

<style scoped lang="postcss">
.foil {
  --red: #f80e35;
  --yellow: #eedf10;
  --green: #21e985;
  --blue: #0dbde9;
  --violet: #c929f1;
}

.foil-scanlines {
  position: absolute;
  --scanlines-space: 1px;
  --scanlines-light: #666;
  --scanlines-dark: black;
  --bars: 3%;
  --bar-color: hsla(0, 0%, 70%, 1);
  --bar-bg: hsla(0, 0%, 0%, 1);
  background-image:
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
    repeating-linear-gradient(
      90deg,
      var(--scanlines-dark) calc(var(--scanlines-space) * 0),
      var(--scanlines-dark) calc(var(--scanlines-space) * 2),
      var(--scanlines-light) calc(var(--scanlines-space) * 2),
      var(--scanlines-light) calc(var(--scanlines-space) * 4)
    );
  background-position:
    calc(((50% - var(--foil-x)) * 2.6) + 50%)
      calc(((50% - var(--foil-y)) * 3.5) + 50%),
    center center;
  background-size:
    400% 400%,
    cover;
  background-blend-mode: overlay;
  filter: brightness(1.1) contrast(1.1) saturate(1.2);
  mix-blend-mode: color-dodge;
  opacity: 0;
  transition: opacity 1s var(--ease-3);
  mask-image: var(--foil-mask);
  mask-size: var(--foil-mask-size, cover);
  mask-position: var(--foil-mask-position, center);
  mask-repeat: no-repeat;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    mask-image: var(--foil-mask);
    mask-size: cover;
    background-image:
      repeating-linear-gradient(
        90deg,
        var(--bar-bg) calc(var(--bars) * 2),
        var(--bar-color) calc(var(--bars) * 3),
        var(--bar-bg) calc(var(--bars) * 3.5),
        var(--bar-color) calc(var(--bars) * 4),
        var(--bar-bg) calc(var(--bars) * 5),
        var(--bar-bg) calc(var(--bars) * 14)
      ),
      repeating-linear-gradient(
        90deg,
        var(--bar-bg) calc(var(--bars) * 2),
        var(--bar-color) calc(var(--bars) * 3),
        var(--bar-bg) calc(var(--bars) * 3.5),
        var(--bar-color) calc(var(--bars) * 4),
        var(--bar-bg) calc(var(--bars) * 5),
        var(--bar-bg) calc(var(--bars) * 10)
      );
    background-position:
      calc((((50% - var(--foil-x)) * 1.65) + 50%) + (var(--foil-y) * 0.5))
        var(--foil-x),
      calc((((50% - var(--foil-x)) * -0.9) + 50%) - (var(--foil-y) * 0.75))
        var(--foil-y);
    background-size:
      200% 200%,
      200% 200%;
    background-blend-mode: screen;
    filter: brightness(1.15) contrast(1.1);
    mix-blend-mode: hard-light;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    mask-image: var(--foil-mask);
    mask-size: cover;
    background-image: radial-gradient(
      farthest-corner circle at var(--glare-x) var(--glare-y),
      hsla(0, 0%, 90%, 0.8) 0%,
      hsla(0, 0%, 78%, 0.1) 25%,
      hsl(0, 0%, 0%, 0) 90%
    );
    background-position: center center;
    background-size: cover;
    mix-blend-mode: luminosity;
    filter: brightness(0.6) contrast(4);
  }
}

:global(:is(.card-perspective-wrapper, .small-card):hover .foil-scanlines) {
  opacity: 1;
}
</style>
