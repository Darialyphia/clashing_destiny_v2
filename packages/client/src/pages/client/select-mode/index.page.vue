<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { assets } from '@/assets';

definePage({
  name: 'SelectMode',
  meta: {
    wrapperClass: 'page-blur'
  }
});
</script>

<template>
  <div class="page">
    <FancyButton
      class="absolute top-10 left-8"
      text="Back"
      size="md"
      :to="{ name: 'ClientHome' }"
    />

    <div class="page-container">
      <h1 class="dual-text" data-text="Choose Your Game Mode">
        Choose Your Game Mode
      </h1>

      <div class="mode-options">
        <RouterLink
          :to="{ name: 'Matchmaking' }"
          class="mode-card surface-transparent"
          :style="{ '--bg': assets['backgrounds/ranked'].css }"
        >
          <h2 class="mode-title">Matchmaking</h2>
          <p class="mode-description">
            Join a queue and get matched with players of similar skill level.
          </p>
        </RouterLink>

        <RouterLink
          :to="{ name: 'Lobbies' }"
          class="mode-card surface-transparent"
          :style="{ '--bg': assets['backgrounds/lobbies'].css }"
        >
          <h2 class="mode-title">Lobby Games</h2>
          <p class="mode-description">
            Create or join custom lobbies to practice and spectate with friends.
          </p>
        </RouterLink>

        <RouterLink
          :to="{ name: 'Sandbox' }"
          class="mode-card surface-transparent"
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
  padding-top: var(--size-12);
  background: url('@/assets/backgrounds/main-menu-overlay.png');
}

.page-container {
  container-type: inline-size;
  text-align: center;
  display: grid;
  place-items: center;
  width: 100vw;
}

h1 {
  font-size: var(--font-size-7);
  font-weight: var(--font-weight-7);
  color: var(--text-1);
  margin-bottom: var(--size-3);
  font-family: 'Cinzel Decorative', serif;
}

.mode-options {
  display: flex;
  justify-content: center;
  gap: var(--size-6);
  margin: 0 auto;
  transition: all 0.25s var(--ease-3);
  @starting-style {
    opacity: 0;
    scale: 1.5;
  }
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
