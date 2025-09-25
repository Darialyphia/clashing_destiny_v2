<template>
  <div class="glare lt-lg:hidden" />
</template>

<style scoped lang="postcss">
.glare {
  position: absolute;
  pointer-events: none;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.3s;
  background-image: radial-gradient(
    farthest-corner circle at var(--glare-x) var(--glare-y),
    hsla(0, 0%, 100%, 0.8) 10%,
    hsla(0, 70%, 100%, 0.65) 20%,
    hsla(0, 0%, 0%, 0.5) 90%
  );
  mix-blend-mode: overlay;
  mask-image: var(--glare-mask);
  mask-size: cover;
  :has(> &):hover & {
    opacity: 1;
  }
}
</style>
