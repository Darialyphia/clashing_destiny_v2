<script setup lang="ts">
import { useLogout } from './auth/composables/useLogout';
import { useMe } from './auth/composables/useMe';
import { useLeaveMatchmaking } from '@/matchmaking/composables';
import MatchmakingTimer from './matchmaking/components/MatchmakingTimer.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const { mutate: logout } = useLogout();
const { data: me } = useMe();
const { mutate: leaveMatchmaking, isLoading: isLeavingMatchmaking } =
  useLeaveMatchmaking();
</script>

<template>
  <header class="flex items-center gap-4 surface">
    <div class="welcome-section">
      <RouterLink :to="{ name: 'ClientHome' }" class="welcome-text">
        Welcome back, {{ me?.username }}
      </RouterLink>
      <div v-if="me?.currentJoinedMatchmaking" class="matchmaking-status">
        <span class="status-label">In matchmaking:</span>
        <span class="matchmaking-name">
          {{ me.currentJoinedMatchmaking.name }}
        </span>
        <MatchmakingTimer
          v-if="me.currentJoinedMatchmaking.joinedAt"
          :joinedAt="me.currentJoinedMatchmaking.joinedAt"
        />
        <FancyButton
          text="Leave"
          variant="error"
          class="leave-button"
          size="sm"
          :isLoading="isLeavingMatchmaking"
          @click="leaveMatchmaking({})"
        />
      </div>
    </div>
    <nav class="ml-auto">
      <ul class="flex gap-4">
        <li>
          <RouterLink :to="{ name: 'SelectMode' }">Play</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
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
  flex-wrap: wrap;
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
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-5);
  display: grid;
}

li a {
  padding: var(--size-3);
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
