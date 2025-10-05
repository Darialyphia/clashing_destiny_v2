<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { useLogout } from './auth/composables/useLogout';
import { useMe } from './auth/composables/useMe';
import { useLeaveMatchmaking } from '@/matchmaking/composables';
import FancyButton from '@/ui/components/FancyButton.vue';
import { computed, ref, watch } from 'vue';

const { mutate: logout } = useLogout();
const { data: me } = useMe();
const { mutate: leaveMatchmaking, isLoading: isLeavingMatchmaking } =
  useLeaveMatchmaking();

// Timer functionality
const currentTime = ref(Date.now());

useIntervalFn(() => {
  currentTime.value = Date.now();
}, 1000);

watch(me, newVal => {
  if (newVal?.currentJoinedMatchmaking) {
    currentTime.value = Date.now(); // Reset timer when joining a matchmaking
  }
});

// Calculate elapsed time in matchmaking
const matchmakingElapsed = computed(() => {
  if (!me.value?.currentJoinedMatchmaking?.joinedAt) return null;

  const elapsed =
    currentTime.value - me.value.currentJoinedMatchmaking.joinedAt;
  if (elapsed < 0) return '00:00'; // Safety check for negative durations
  return formatDuration(elapsed);
});

// Format duration in mm:ss format
function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
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
        <div v-if="matchmakingElapsed" class="matchmaking-timer">
          <span class="timer-value">{{ matchmakingElapsed }}</span>
        </div>
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
          <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Matchmaking' }">Play</RouterLink>
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

.matchmaking-timer {
  display: flex;
  align-items: center;
  gap: var(--size-1);
  margin-left: var(--size-1);
}

.timer-value {
  color: #efef9f;
  font-weight: var(--font-weight-6);
  font-family: 'Courier New', monospace;
  padding: var(--size-1) var(--size-2);
  text-align: center;
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
