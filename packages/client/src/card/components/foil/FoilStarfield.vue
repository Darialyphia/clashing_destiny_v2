<script setup lang="ts"></script>

<template>
  <div class="foil foil-rain" aria-hidden="true">
    <div
      class="back parallax"
      style="--parallax-strength-x: 10; --parallax-strength-y: -3"
    />
    <div
      class="front parallax"
      style="--parallax-strength-x: -4; --parallax-strength-y: 5"
    />
  </div>
</template>

<style scoped lang="postcss">
.foil-rain {
  --glare-opacity: 0;
  position: absolute;
  inset: 0;
  overflow: hidden;
  mix-blend-mode: color-dodge;
  filter: drop-shadow(0 0 2px rgba(190, 220, 255, 0.8));

  .back,
  .front {
    position: absolute;
    inset: 0;
    background:
      /* radial-gradient(
        circle at 13% 18%,
        rgba(255, 255, 255, 0.95) 0 1px,
        transparent 2px
      ),
      radial-gradient(
        circle at 31% 72%,
        rgba(141, 231, 255, 0.9) 0 1px,
        transparent 1.8px
      ), */
      radial-gradient(
        circle at 67% 24%,
        rgba(255, 177, 248, 0.9) 0 1px,
        transparent 2px
      ),
      radial-gradient(
        circle at 86% 61%,
        rgba(255, 246, 182, 0.9) 0 1px,
        transparent 2px
      ),
      radial-gradient(
        circle at 48% 45%,
        rgba(255, 255, 255, 0.9) 0 1.3px,
        transparent 2.1px
      ),
      radial-gradient(
        farthest-corner circle at var(--glare-x) var(--glare-y),
        hsla(0, 0%, 95%, 0.15) 10%,
        hsla(177, 22%, 80%, 0.1) 20%,
        hsla(150, 20%, 10%, 0.6) 90%
      );
    background-size:
      /* 71px 83px,
      97px 109px, */
      127px 101px,
      151px 133px,
      113px 149px,
      cover;
    background-position:
      /* calc(var(--mxn, 0) * 9px) calc(var(--myn, 0) * 8px),
      calc(var(--mxn, 0) * -13px) calc(var(--myn, 0) * 11px), */
      calc(var(--mxn, 0) * 16px) calc(var(--myn, 0) * -10px),
      calc(var(--mxn, 0) * -8px) calc(var(--myn, 0) * -15px),
      calc(var(--mxn, 0) * 11px) calc(var(--myn, 0) * 13px),
      center center;
    background-blend-mode: soft-light, soft-light, color-burn;
  }

  .back {
    --mxn: 75;
    --myn: 40;
  }
}
</style>
