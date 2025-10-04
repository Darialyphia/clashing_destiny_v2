<script setup lang="ts">
import { useLogout } from './auth/composables/useLogout';
import { useMe } from './auth/composables/useMe';

const { mutate: logout } = useLogout();
const { data: me } = useMe();
</script>

<template>
  <header class="flex items-center gap-4 surface">
    <div>Welcome back, {{ me?.username }}</div>
    <nav class="ml-auto">
      <ul class="flex gap-4">
        <li>
          <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
        </li>
        <li>
          <button @click="logout({})">Logout</button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped lang="postcss">
li {
  padding: var(--size-3);
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-5);
  display: grid;
}

li:hover {
  background: hsl(40 60% 60% / 0.15);
}
</style>
