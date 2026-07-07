<script setup lang="ts">
import UnauthenticatedHeader from '@/UnauthenticatedHeader.vue';
import GameRules from '@/tutorial/components/GameRules.vue';

definePage({
  name: 'HowToPlayPublic'
});
</script>

<template>
  <div class="how-to-play-page">
    <UnauthenticatedHeader />
    <div class="how-to-play-container fancy-scrollbar">
      <h1 class="dual-text" data-text="How To Play">How To Play</h1>
      <div class="divider" />
      <GameRules />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.dual-text {
  color: transparent;
  position: relative;
  --_top-color: var(--top-color, #efef9f);
  --_bottom-color: var(--bottom-color, #d7ad42);
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
    z-index: -1;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}

.how-to-play-page {
  display: grid;
  height: 100dvh;
  grid-template-rows: auto 1fr;
  pointer-events: auto;
  background: url('@/assets/backgrounds/main-menu.jpg');
  background-size: cover;
  background-attachment: fixed;
}

h1 {
  font-family: 'Cinzel Decorative', serif;
  text-align: center;
  font-size: var(--font-size-7);
  font-weight: 800;
  margin: 1rem;
}

.how-to-play-container {
  margin-inline: auto;
  overflow-y: auto;
}
</style>
