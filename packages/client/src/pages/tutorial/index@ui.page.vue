<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { missions } from './missions';

definePage({
  name: 'TutorialList'
});
</script>
<template>
  <div class="page">
    <section class="surface px-8">
      <h1>Tutorial</h1>

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
  text-align: center;
}

.back {
  text-decoration: underline;
}

ul {
  margin-block: var(--size-5);
  li {
    font-weight: var(--font-weight-5);
  }
}
</style>
