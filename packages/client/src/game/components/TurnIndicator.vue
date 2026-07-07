<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent } from '../composables/useGameClient';
import { waitFor } from '@game/shared';

const phase = ref<string | null>(null);

useFxEvent(FX_EVENTS.TURN_START, async event => {
  phase.value = `Turn ${event.turnCount + 1}`;
  await waitFor(1250);
  phase.value = null;
  await waitFor(400);
});
</script>

<template>
  <Transition name="phase">
    <div class="game-phase-indicator" v-if="phase">
      <div class="phase-content">
        <div class="line line-top"></div>
        <div class="phase-text dual-text" :data-text="phase">{{ phase }}</div>
        <div class="line line-bottom"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.dual-text {
  color: transparent;
  position: relative;
  --_top-color: var(--top-color, #dec7a6);
  --_bottom-color: var(--bottom-color, #bba083);
  &::before,
  &::after {
    position: absolute;
    content: attr(data-text);
    color: transparent;
    inset: 0;
  }
  &:after {
    background: linear-gradient(
      var(--_top-color),
      var(--_top-color) 50%,
      var(--_bottom-color) 50%
    );
    line-height: 1.2;
    background-clip: text;
    background-size: 100% 1lh;
    background-repeat: repeat-y;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
  &:before {
    -webkit-text-stroke: calc(2px * var(--pixel-scale)) black;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}

.game-phase-indicator {
  position: fixed;
  inset: 0;
  display: grid;
  place-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  pointer-events: none;
  font-family:
    Cinzel Decorative,
    serif;
}

.phase-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.line {
  width: 300px;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #dec7a6 10%,
    #bba093 50%,
    #dec7a6 90%,
    transparent 100%
  );
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.phase-text {
  font-size: 4rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Enter animations */
.phase-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.phase-enter-from {
  opacity: 0;
}

.phase-enter-from .phase-text {
  transform: scale(0.5);
  opacity: 0;
}

.phase-enter-from .line-top {
  transform: translateX(-300%);
  opacity: 0;
}

.phase-enter-from .line-bottom {
  transform: translateX(300%);
  opacity: 0;
}

.phase-enter-to .phase-text {
  transform: scale(1);
  opacity: 1;
}

.phase-enter-to .line-top,
.phase-enter-to .line-bottom {
  transform: translateX(0);
  opacity: 1;
}

/* Leave animations */
.phase-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.phase-leave-active .line,
.phase-leave-active .phase-text {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.phase-leave-to {
  opacity: 0;
}

.phase-leave-to .phase-text {
  transform: scale(1.2);
  opacity: 0;
}

.phase-leave-to .line-top {
  transform: translateX(100%);
  opacity: 0;
}

.phase-leave-to .line-bottom {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
