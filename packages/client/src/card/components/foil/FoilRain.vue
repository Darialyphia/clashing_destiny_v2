<script setup lang="ts">
import { ref } from 'vue';

type RainParticle = {
  x: number;
  length: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const particles = ref<RainParticle[]>(
  Array.from({ length: 60 }, () => {
    const length = randomBetween(4, 30);

    return {
      x: randomBetween(2, 98),
      length,
      duration: Math.max(620, 1800 - length * 48 + randomBetween(-120, 220)),
      delay: randomBetween(-2200, 0),
      drift: randomBetween(-10, 10),
      opacity: randomBetween(0.26, 0.92)
    };
  })
);
</script>

<template>
  <div class="foil foil-rain" aria-hidden="true">
    <span
      v-for="(particle, index) in particles"
      :key="index"
      class="rain-particle"
      :style="{
        '--x': `${particle.x}%`,
        '--length': `${particle.length}px`,
        '--duration': `${particle.duration}ms`,
        '--delay': `${particle.delay}ms`,
        '--drift': `${particle.drift}px`,
        '--opacity': particle.opacity
      }"
    />
  </div>
</template>

<style scoped lang="postcss">
@keyframes foil-rain-fall {
  0% {
    transform: translate3d(0, -20%, 0) scaleY(0.65);
    opacity: 0;
  }
  10% {
    opacity: var(--opacity);
  }
  100% {
    transform: translate3d(var(--drift), 750px, 0) scaleY(1.25);
    opacity: 0;
  }
}

@keyframes foil-rain-glow {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.35;
  }
  100% {
    opacity: 0;
  }
}

.foil-rain {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  mask-image: var(--foil-mask);
  -webkit-mask-image: var(--foil-mask);
  mask-size: var(--foil-mask-size, cover);
  mask-position: var(--foil-mask-position, center);
  mask-repeat: no-repeat;
  mix-blend-mode: color-dodge;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(var(--blue-12), var(--cyan-4), transparent);
    transition: opacity 1s ease-in-out;
    animation: foil-rain-glow 4s ease-in-out infinite alternate;
  }
}

.rain-particle {
  position: absolute;
  top: -10%;
  left: var(--x);
  width: calc(0.5px * var(--pixel-scale));
  height: var(--length);
  border-radius: 999px;
  background: white;
  box-shadow:
    0 0 3px rgba(179, 216, 255, 0.9),
    0 0 10px rgba(130, 170, 255, 0.45);
  transform-origin: top center;
  animation: foil-rain-fall var(--duration) linear infinite;
  animation-delay: var(--delay);
  opacity: var(--opacity);
  filter: blur(0.2px);
}
</style>
