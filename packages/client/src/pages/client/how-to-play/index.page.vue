<script setup lang="ts">
// @ts-expect-error
import { VueComponent as HowToPlay } from '@/tutorial/how-to-play.md';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';

definePage({
  name: 'HowToPlay',
  path: '/how-to-play'
});
</script>

<template>
  <div class="how-to-play-page">
    <AuthenticatedHeader />
    <h1>How To Play</h1>

    <div class="how-to-play-container">
      <HowToPlay />
    </div>
  </div>
</template>

<style lang="postcss">
.how-to-play-page {
  display: grid;
  height: 100dvh;
  grid-template-rows: auto 1fr;
  pointer-events: auto;
}
.how-to-play-container {
  max-width: var(--size-lg);
  margin-inline: auto;
  overflow-y: auto;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-block: 1rem;
  }
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-block: 1rem;
  }
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-block: 1rem;
  }
  h4 {
    font-size: 1.125rem;
    font-weight: 700;
    margin-block: 1rem;
  }
}
</style>
