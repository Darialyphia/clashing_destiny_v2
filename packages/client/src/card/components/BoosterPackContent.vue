<script setup lang="ts">
import { computed } from 'vue';
import { RARITIES } from '@game/engine/src/card/card.enums';
import BlueprintCard from './BlueprintCard.vue';
import {
  provideBoosterPack,
  type BoosterPackCardEntry
} from '../composables/useBoosterPack';

const props = defineProps<{
  cards: BoosterPackCardEntry[];
}>();

const {
  isRevealed,
  dealingStatus,
  isShaking,
  startSweep,
  endSweep,
  onCardHover,
  reveal,
  wrapperRefs,
  containerRef,
  canvasContainerRef,
  cardStyles,
  allRevealed,
  boosterId
} = provideBoosterPack({
  cards: computed(() => props.cards)
});

const cardsWithParticles = computed(() => {
  return props.cards.map(card => {
    const isLegendary = card.blueprint.rarity === RARITIES.LEGENDARY;
    const particleCount = isLegendary ? 60 : 20;

    return {
      ...card,
      particles: Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x:
          (Math.random() < 0.5 ? -1 : 1) *
          ((isLegendary ? 300 : 200) + Math.random() * 200),
        y:
          (Math.random() < 0.5 ? -1 : 1) *
          ((isLegendary ? 300 : 200) + Math.random() * 200),
        size: Math.random() * (isLegendary ? 8 : 5) + (isLegendary ? 3 : 2),
        delay: Math.random() * (isLegendary ? 1.5 : 0.5),
        speed: isLegendary ? 1.5 : 0.8,
        color: isLegendary ? '#ffd700' : 'white'
      }))
    };
  });
});
</script>

<template>
  <Transition appear>
    <div class="overflow-hidden">
      <div
        class="booster-pack-content"
        :class="[dealingStatus, { 'is-shaking': isShaking }]"
        ref="containerRef"
        @mouseup="endSweep"
        @mouseleave="endSweep"
      >
        <div ref="canvasContainerRef" class="canvas-overlay"></div>
        <div
          v-for="(card, index) in cardsWithParticles"
          :key="`${boosterId}-${index}`"
          class="card-slot"
          :style="cardStyles[index]"
          :class="{ 'is-shaking': isShaking }"
          @click="reveal(index)"
          @mousedown="startSweep(index)"
          @mouseenter="onCardHover(index)"
        >
          <div
            class="card-wrapper"
            ref="wrapperRefs"
            :id="`booster-card-${index}`"
            :class="{
              revealed: isRevealed(index),
              [`rarity-${card.blueprint.rarity.toLowerCase()}`]: true
            }"
          >
            <BlueprintCard
              class="booster-card"
              :class="`booster-card-${card.blueprint.rarity.toLocaleLowerCase()}`"
              :blueprint="card.blueprint"
              :is-foil="isRevealed(index) ? card.isFoil : false"
            />

            <div class="god-rays" />

            <div
              v-for="particle in card.particles"
              :key="particle.id"
              class="particle"
              :style="{
                '--x': `${particle.x}px`,
                '--y': `${particle.y}px`,
                '--size': `${particle.size}px`,
                '--delay': `${particle.delay}s`,
                '--duration': `${particle.speed}s`,
                '--color': `${particle.color}`
              }"
            />
          </div>
        </div>
        <Transition name="fade">
          <div v-if="dealingStatus === 'waiting'" class="stack-glow"></div>
        </Transition>
        <Transition name="done">
          <div
            v-if="dealingStatus === 'done' && allRevealed"
            class="absolute bottom-7"
          >
            <slot name="done"></slot>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
@keyframes booster-enter {
  from {
    transform: scale(0.5) rotateX(90deg);
    opacity: 0;
    translate: 0 300px;
  }
  50% {
    translate: 0 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.canvas-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 100;
}

/* eslint-disable-next-line vue-scoped-css/no-unused-selector */
.booster-pack-content {
  transform-style: preserve-3d;
  perspective: 1300px;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 800px; /* Ensure enough space */
  max-width: 100vw;

  &.is-shaking::after {
    content: '';
    position: absolute;
    inset: 0;
    backdrop-filter: blur(10px);
    mask: radial-gradient(
      circle at center,
      transparent 0%,
      transparent 25%,
      black 60%,
      black 100%
    );
    background-color: hsl(0 0% 0% / 0.7);
    transition: opacity 3s var(--ease-3);
    @starting-style {
      opacity: 0;
    }
  }
  &.v-enter-active {
    animation: booster-enter 0.8s var(--ease-out-2);
  }
}

@property --conic-gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
@property --conic-gradient-angle-2 {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes booster-border-gradient-rotate {
  from {
    --conic-gradient-angle: 0deg;
    --conic-gradient-angle-2: 0deg;
  }
  to {
    --conic-gradient-angle: 360deg;
    --conic-gradient-angle-2: -360deg;
  }
}
.card-slot {
  position: absolute;
  transform-style: preserve-3d;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index);

  transition: transform 0.4s
    linear(
      0,
      0.544 5.5%,
      0.947 11.5%,
      1.213 18.1%,
      1.298 21.7%,
      1.352 25.5%,
      1.372 28.2%,
      1.379 31.1%,
      1.374 34.2%,
      1.357 37.6%,
      1.307 43.7%,
      1.121 61.8%,
      1.074 67.8%,
      1.04 73.7%,
      1.007 84.7%,
      1
    );
  transition-delay: calc(var(--child-index) * 0.05s);

  &:not(:has(.revealed)) {
    --shake-duration: 3s;
    &.is-shaking {
      --shake-duration: 1.5s;
    }
  }
}

@property --booster-reveal-sheen-start {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@property --booster-reveal-sheen-end {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}

@keyframes booster-reveal-sheen {
  from {
    --booster-reveal-sheen-start: 0%;
    --booster-reveal-sheen-end: 0%;
    opacity: 0.7;
  }
  to {
    --booster-reveal-sheen-start: 110%;
    --booster-reveal-sheen-end: 115%;
    opacity: 0.7;
  }
}

.card-wrapper {
  --pixel-scale: 1.5;
  width: calc(var(--card-width) * var(--pixel-scale));
  aspect-ratio: var(--card-ratio);
  transform-origin: center center;
  transform-style: preserve-3d;
  &:not(.revealed) .booster-card {
    transform: rotateY(180deg);
  }
  &.revealed {
    --space: 5%;
    --angle: 135deg;
    --booster-reveal-sheen-start: 0%;
    --booster-reveal-sheen-end: 0%;
    &::after {
      content: '';
      inset: 0;
      position: absolute;
      opacity: 0;
      background: repeating-linear-gradient(
        135deg,
        rgb(255, 119, 115) calc(var(--space) * 1),
        rgba(255, 237, 95, 1) calc(var(--space) * 2),
        rgba(168, 255, 95, 1) calc(var(--space) * 3),
        rgba(131, 255, 247, 1) calc(var(--space) * 4),
        rgba(120, 148, 255, 1) calc(var(--space) * 5),
        rgb(216, 117, 255) calc(var(--space) * 6),
        rgb(255, 119, 115) calc(var(--space) * 7)
      );
      mask-image: linear-gradient(
        135deg,
        transparent,
        transparent calc(var(--booster-reveal-sheen-start) - 10%),
        black var(--booster-reveal-sheen-start),
        black var(--booster-reveal-sheen-end),
        transparent calc(var(--booster-reveal-sheen-end) + 10%)
      );
      animation: booster-reveal-sheen 1s forwards;
      animation-delay: 0.25s;
      mix-blend-mode: overlay;
    }
    .booster-card {
      animation: booster-reveal-bloom 0.6s;
      animation-delay: 0.4s;
      transition: transform 0.4s var(--ease-out-2);
    }
  }
  &:not(.revealed)::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    filter: blur(4px);
    background:
      conic-gradient(
        from var(--conic-gradient-angle) at center,
        cyan 0deg,
        orange 20deg,
        transparent 20deg
      ),
      conic-gradient(
        from var(--conic-gradient-angle-2) at center,
        magenta 0deg,
        yellow 20deg,
        transparent 20deg
      );
    animation: booster-border-gradient-rotate var(--shake-duration) linear
      infinite;
  }
}

@keyframes booster-rarity-shadow {
  from,
  to {
    box-shadow:
      0 0 0px var(--shadow-color),
      0 0 10px hsla(from var(--shadow-color) h s l / 0.6),
      0 0 30px hsla(from var(--shadow-color) h s l / 0.3);
  }
  50% {
    box-shadow:
      0 0 20px var(--shadow-color),
      0 0 40px hsla(from var(--shadow-color) h s l / 0.6),
      0 0 60px hsla(from var(--shadow-color) h s l / 0.3);
  }
}

.done .booster-card-rare {
  --shadow-color: var(--rarity-rare);
  animation: booster-rarity-shadow 2s infinite;
}
.done .booster-card-epic {
  --shadow-color: var(--rarity-epic);
  animation: booster-rarity-shadow 2s infinite;
}
.done .booster-card-legendary {
  --shadow-color: var(--rarity-legendary);
  animation: booster-rarity-shadow 2s infinite;
}

.particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size);
  height: var(--size);
  background: var(--color);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  box-shadow: 0 0 5px var(--color);
  z-index: 10;
}

.revealed .particle {
  animation: particle-explode 0.8s ease-out forwards;
  animation-delay: calc(0.2s + var(--delay));
  animation-duration: var(--duration, 0.8s);
}

.rarity-legendary .particle {
  box-shadow:
    0 0 10px var(--color),
    0 0 20px #ff8c00,
    0 0 40px #ff4500;
  mix-blend-mode: screen;
}

@keyframes particle-explode {
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(0);
    opacity: 0;
  }
}

.stack-glow {
  position: absolute;
  width: calc(var(--pixel-scale) * var(--card-width));
  height: calc(var(--pixel-scale) * var(--card-height));
  background: radial-gradient(circle at center, red, transparent 40%);
  z-index: 6;
  filter: blur(30px);
  animation: booster-pulse-glow 4s linear infinite;
  pointer-events: none;
  mix-blend-mode: screen;
  translate: 0 50px;
  scale: 2;
}

@keyframes booster-reveal-bloom {
  25% {
    filter: brightness(4) saturate(0.65);
  }
}

@keyframes booster-pulse-glow {
  0% {
    opacity: 0.1;
    transform: scale(0.8);
    filter: hue-rotate(0deg);
  }
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.8);
    filter: hue-rotate(360deg);
    opacity: 0.1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: scale 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  scale: 0;
}

.done-enter-active,
.done-leave-active {
  transition: all 0.3s;
}

.done-enter-from,
.done-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
