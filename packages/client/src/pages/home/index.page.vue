<script setup lang="ts">
import RegisterForm from '@/auth/components/RegisterForm.vue';

definePage({
  name: 'Home',
  path: '/'
});
</script>

<template>
  <nav>
    <ul class="flex gap-4 surface">
      <li>
        <RouterLink :to="{ name: 'HowToPlay' }">How to play</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'TutorialList' }">Tutorial</RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
      </li>
    </ul>
  </nav>

  <RegisterForm />
</template>

<style scoped lang="postcss">
li {
  padding: var(--size-3);
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-5);
}

li:hover {
  background: hsl(40 60% 60% / 0.15);
}
</style>
