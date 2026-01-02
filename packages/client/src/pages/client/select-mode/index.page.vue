<script setup lang="ts">
import { assets } from '@/assets';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';

definePage({
  name: 'SelectMode'
});
</script>

<template>
  <div class="page">
    <AuthenticatedHeader />

    <div class="page-container">
      <h1 class="dual-text" data-text="Choose Your Game Mode">
        Choose Your Game Mode
      </h1>

      <div class="mode-options">
        <RouterLink
          :to="{ name: 'Matchmaking' }"
          class="mode-card"
          :style="{ '--bg': assets['backgrounds/ranked'].css }"
        >
          <h2 class="mode-title">Matchmaking</h2>
          <p class="mode-description">
            Join a queue and get matched with players of similar skill level.
          </p>
        </RouterLink>

        <RouterLink
          :to="{ name: 'Lobbies' }"
          class="mode-card"
          :style="{ '--bg': assets['backgrounds/lobbies'].css }"
        >
          <h2 class="mode-title">Lobby Games</h2>
          <p class="mode-description">
            Create or join custom lobbies to practice and spectate with friends.
          </p>
        </RouterLink>

        <RouterLink
          :to="{ name: 'Sandbox' }"
          class="mode-card"
          :style="{ '--bg': assets['backgrounds/sandbox'].css }"
        >
          <h2 class="mode-title">Sandbox</h2>
          <p class="mode-description">
            Play a game where you control both players to practice strategies.
          </p>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.page {
  min-height: 100vh;
  background: var(--surface-1);
  display: grid;
  grid-template-rows: auto 1fr;
}

.page-container {
  container-type: inline-size;
  text-align: center;
}

h1 {
  font-size: var(--font-size-7);
  font-weight: var(--font-weight-7);
  color: var(--text-1);
  margin-bottom: var(--size-3);
  font-family: 'Cinzel Decorative', serif;
}

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

.mode-options {
  display: flex;
  justify-content: center;
  gap: var(--size-6);
  margin: 0 auto;
}

.mode-card {
  text-align: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  padding: var(--size-7);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: var(--size-xs);
  aspect-ratio: 9 / 12;
  position: relative;
  background: linear-gradient(to bottom, black, transparent, black), var(--bg);
  background-size: cover;
  &:hover {
    box-shadow: 0 0 20px #efef9f;
  }
}

.mode-title {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
}

.mode-description {
  padding-top: var(--size-3);
  font-size: var(--font-size-3);
  color: var(--text-2);
  line-height: var(--line-height-3);
  margin-bottom: var(--size-5);
  text-wrap: balance;
}

@container (max-width: 500px) {
  .mode-options {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: var(--font-size-6);
  }
}
</style>
