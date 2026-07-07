<script setup lang="ts"></script>

<template>
  <div class="foil foil-scanlines"></div>
</template>

<style scoped lang="postcss">
.foil {
}

.foil-scanlines {
  position: absolute;
  mix-blend-mode: color-dodge;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #efefef;
    opacity: 0.15;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.15;
    background-image: repeating-linear-gradient(
      0deg,
      #0e152e 0%,
      hsl(180, 10%, 60%) 8%,
      hsl(180, 29%, 66%) 12%,
      hsl(180, 10%, 60%) 20%,
      #0e152e 25%,
      #0e152e 30%
    );
    background-size: 500%;
    background-repeat: no-repeat;
    background-position: var(--foil-x) var(--foil-y);
    mix-blend-mode: difference;
  }
}
</style>
