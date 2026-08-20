<script setup lang="ts"></script>

<template>
  <div class="foil foil-aurora-border"></div>
</template>

<style scoped lang="postcss">
.foil {
}

@property --foil-aurora-border-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes foil-aurora-border-gradient-rotate {
  from {
    --foil-aurora-border-angle: 0deg;
  }
  to {
    --foil-aurora-border-angle: 360deg;
  }
}

.foil-aurora-border {
  position: absolute;
  mix-blend-mode: color-dodge;
  transition: opacity 0.3s ease-in-out;
  inset: 0;
  opacity: 1;
  background: conic-gradient(
    from var(--foil-aurora-border-angle) at center,
    cyan,
    transparent,
    magenta,
    transparent,
    yellow,
    transparent,
    cyan
  );
  animation: foil-aurora-border-gradient-rotate 6s linear infinite;
  clip-path: polygon(
    0% 0%,
    0% 100%,
    3% 100%,
    3% 3%,
    97% 3%,
    97% 97%,
    3% 97%,
    3% 100%,
    100% 100%,
    100% 0%
  );
}

:global(:is(.card-perspective-wrapper, .small-card):hover .foil-aurora-border) {
  opacity: 1;
  transition-delay: 0.3s;
}
</style>
