<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { assets } from '@/assets';
import PageTitle from '@/shared/components/PageTitle.vue';

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
      class="absolute top-10 left-8 lt-lg:top-3 lt-lg:left-0"
      text="Back"
      size="md"
      :to="{ name: 'ClientHome' }"
    />

    <div class="page-container">
      <PageTitle title="Choose Your Game Mode" />

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
          <h2 class="mode-title">Lobbies</h2>
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
  background-size: 100% 100%;
  @screen lt-lg {
    padding-top: var(--size-3);
  }
}

.page-container {
  container-type: inline-size;
  text-align: center;
  display: grid;
  place-items: center;
  width: 100vw;
}

.mode-options {
  display: flex;
  justify-content: center;
  gap: var(--size-6);
  margin: 0 auto;
  @screen lt-lg {
    overflow-x: auto;
    padding-inline: var(--size-6);
  }
}

.mode-card {
  text-align: center;
  transition: all 0.2s ease;
  padding: var(--size-7);
  display: flex;
  @screen lg {
    justify-content: flex-end;
  }
  flex-direction: column;
  width: var(--size-xs);
  @screen lt-lg {
    width: var(--size-13);
    aspect-ratio: 1;
  }
  aspect-ratio: 9 / 12;
  position: relative;
  background: linear-gradient(to bottom, black, transparent, black), var(--bg);

  transition-delay: calc(0.05s * sibling-index());
  @starting-style {
    scale: 1.5;
    opacity: 0;
  }

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
  text-wrap: balance;
  @screen lt-lg {
    font-size: var(--font-size-2);
    -webkit-text-stroke: 2px black;
    paint-order: stroke fill;
    font-weight: var(--font-weight-5);
  }
  @screen lg {
    margin-bottom: var(--size-5);
  }
}

@container (max-width: 500px) {
  .mode-options {
    grid-template-columns: 1fr;
  }
}
</style>
