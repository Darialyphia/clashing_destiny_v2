<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { missions } from './missions';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';

definePage({
  name: 'TutorialHome'
});
</script>
<template>
  <div class="page">
    <AuthenticatedHeader />
    <section class="surface">
      <h2>How to play</h2>

      <h3>Rule book</h3>
      <p>
        For a comprehensive guide on how to play the game, please refer to our
        <RouterLink :to="{ name: 'HowToPlay' }">How To Play</RouterLink>
        section.
      </p>

      <h3>Tutorial Missions</h3>
      <ul>
        <li v-for="mission in missions" :key="mission.id">
          <RouterLink
            :to="{ name: 'TutorialMission', params: { id: mission.id } }"
          >
            {{ mission.name }}
          </RouterLink>
        </li>
      </ul>

      <RouterLink class="back" :to="{ name: 'Home' }">Back to Home</RouterLink>
    </section>
  </div>
</template>

<style scoped lang="postcss">
.page {
  height: 100dvh;
}

section {
  max-width: fit-content;
  margin: var(--size-8) auto;
}
h2 {
  font-size: var(--font-size-6);
  font-weight: var(--font-weight-7);
  margin-block-end: var(--size-3);
  text-align: center;
}

.back {
  text-decoration: underline;
}

ul {
  margin-block: var(--size-5);
  li > * {
    font-weight: var(--font-weight-5);
    padding: var(--size-2) var(--size-3);
    border-radius: var(--radius-2);
    &:hover {
      background: hsl(40 60% 60% / 0.15);
    }
  }
}
</style>
