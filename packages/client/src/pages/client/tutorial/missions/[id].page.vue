<script setup lang="ts">
import Tutorial from '../Tutorial.vue';
import { missions } from '../missions';

definePage({
  name: 'TutorialMission'
});

const route = useRoute<'TutorialMission'>();

const options = computed(
  () => missions.find(mission => mission.id === route.params.id)?.options
);
</script>

<template>
  <Tutorial v-if="options" :options="options" />
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
