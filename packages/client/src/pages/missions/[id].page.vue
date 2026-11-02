<script setup lang="ts">
import Tutorial from '@/tutorial/components/Tutorial.vue';
import { missions } from './index.js';
import { provideAuth } from '@/auth/composables/useAuth.js';

definePage({
  name: 'TutorialMission'
});

const route = useRoute<'TutorialMission'>();

const mission = computed(() =>
  missions.find(mission => mission.id === route.params.id)
);

provideAuth();
</script>

<template>
  <!-- keyed so going to the next mission starts a new tutorial instead of reusing this one -->
  <Tutorial
    v-if="mission"
    :key="mission.id"
    :options="mission.options"
    :next-mission="mission.nextMission"
  />
  <div v-else class="page">
    <section class="surface px-8 text-center">
      <h1>Tutorial Mission Not Found</h1>
      <p>The requested tutorial mission does not exist.</p>
      <RouterLink class="back" :to="{ name: 'TutorialHome' }">
        Back to Tutorial List
      </RouterLink>
    </section>
  </div>
</template>

<style scoped lang="postcss">
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  font-size: var(--font-size-2);
}

h1 {
  font-size: var(--font-size-6);
  font-weight: var(--font-weight-7);
  margin-block-end: var(--size-3);
}

.back {
  text-decoration: underline;
}
</style>
