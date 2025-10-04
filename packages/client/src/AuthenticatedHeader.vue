<script setup lang="ts">
import { useLogout } from './auth/composables/useLogout';
import { useMe } from './auth/composables/useMe';

const { mutate: logout } = useLogout();
const { data: me } = useMe();
</script>

<template>
  <header class="flex items-center gap-4 surface">
    <div class="welcome-section">
      <span class="welcome-text">Welcome back, {{ me?.username }}</span>
      <div v-if="me?.currentJoinedMatchmaking" class="matchmaking-status">
        <span class="status-label">In matchmaking:</span>
        <span class="matchmaking-name">
          {{ me.currentJoinedMatchmaking.name }}
        </span>
      </div>
    </div>
    <nav class="ml-auto">
      <ul class="flex gap-4">
        <li>
          <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Matchmaking' }">Matchmaking</RouterLink>
        </li>
        <li>
          <button @click="logout({})">Logout</button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped lang="postcss">
.welcome-section {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}

.welcome-text {
  font-weight: var(--font-weight-5);
  color: #efef9f;
}

.matchmaking-status {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: 0.85rem;
}

.status-label {
  color: #a8a8a8;
}

.matchmaking-name {
  color: #d7ad42;
  font-weight: var(--font-weight-6);
  padding: var(--size-1) var(--size-2);
  background: hsl(45 100% 50% / 0.1);
  border-radius: var(--radius-1);
  border: 1px solid hsl(45 100% 50% / 0.2);
}

li {
  padding: var(--size-3);
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-5);
  display: grid;
}

li:hover {
  background: hsl(40 60% 60% / 0.15);
}

@media (max-width: 768px) {
  .welcome-section {
    display: none;
  }
}
</style>
