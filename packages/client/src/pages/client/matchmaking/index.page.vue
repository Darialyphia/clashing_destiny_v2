<script setup lang="ts">
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import {
  useJoinMatchmaking,
  useLeaveMatchmaking
} from '@/matchmaking/composables';
import { useMatchmakingList } from './useMatchmakingList';
import { useMe } from '@/auth/composables/useMe';

definePage({
  name: 'Matchmaking'
});

const { data: me } = useMe();

const { data, isLoading } = useMatchmakingList();
const { mutate: join, isLoading: isJoining } = useJoinMatchmaking();
const { mutate: leave, isLoading: isLeaving } = useLeaveMatchmaking();

// Helper function to check if user is in a specific matchmaking
const isInMatchmaking = (matchmakingName: string) => {
  return me.value?.currentJoinedMatchmaking?.name === matchmakingName;
};

const handleJoin = (matchmakingName: string) => {
  // TODO: Add deck selection logic - for now using a placeholder
  // In a real implementation, you'd want to show a deck selector first
  const placeholderDeckId = 'placeholder' as any; // This needs to be a real deck ID

  join({
    name: matchmakingName,
    deckId: placeholderDeckId
  });
};

const handleLeave = () => {
  leave({});
};
</script>

<template>
  <div class="matchmaking-page">
    <AuthenticatedHeader />
    <main class="container">
      <h1 class="page-title">Matchmaking</h1>

      <div v-if="isLoading" class="loading-state">Loading matchmakings...</div>

      <div v-else-if="!data?.length" class="empty-state">
        No matchmakings available.
      </div>

      <div v-else class="matchmaking-list">
        <div
          v-for="matchmaking in data"
          :key="matchmaking.id"
          class="matchmaking-card"
        >
          <div class="matchmaking-info">
            <h3 class="matchmaking-name">{{ matchmaking.name }}</h3>
            <p v-if="!matchmaking.enabled" class="disabled-notice">
              Currently disabled
            </p>
          </div>

          <div class="matchmaking-actions">
            <button
              v-if="!isInMatchmaking(matchmaking.name)"
              :disabled="
                !matchmaking.enabled ||
                !!me?.currentJoinedMatchmaking ||
                isJoining
              "
              @click="handleJoin(matchmaking.name)"
              class="btn btn-primary"
            >
              {{ isJoining ? 'Joining...' : 'Join' }}
            </button>

            <button
              v-else
              :disabled="isLeaving"
              @click="handleLeave"
              class="btn btn-secondary"
            >
              {{ isLeaving ? 'Leaving...' : 'Leave' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss">
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--size-6);
}

.page-title {
  font-family: 'Cinzel Decorative', serif;
  font-size: 2.5rem;
  font-weight: var(--font-weight-7);
  color: transparent;
  background-image: linear-gradient(45deg, #efef9f, #d7ad42);
  background-clip: text;
  text-align: center;
  margin-bottom: var(--size-8);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--size-8);
  color: #a8a8a8;
  font-size: 1.1rem;
}

.matchmaking-list {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

.matchmaking-card {
  background: linear-gradient(
    135deg,
    hsl(240 30% 10%) 0%,
    hsl(245 25% 15%) 100%
  );
  border: 1px solid hsl(45 50% 30% / 0.3);
  border-radius: var(--radius-3);
  padding: var(--size-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.matchmaking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px hsl(240 100% 5% / 0.3);
}

.matchmaking-info {
  flex: 1;
}

.matchmaking-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: 1.25rem;
  font-weight: var(--font-weight-6);
  color: #efef9f;
  margin-bottom: var(--size-2);
}

.disabled-notice {
  color: #ff6b6b;
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
}

.matchmaking-actions {
  display: flex;
  gap: var(--size-3);
}

.btn {
  padding: var(--size-3) var(--size-5);
  border: none;
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-6);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  min-width: 80px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(45deg, #d7ad42, #efef9f);
  color: hsl(240 100% 5%);
  box-shadow: 0 3px 10px hsl(45 100% 50% / 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px hsl(45 100% 50% / 0.4);
}

.btn-secondary {
  background: linear-gradient(45deg, #6b7280, #9ca3af);
  color: white;
  box-shadow: 0 3px 10px hsl(220 15% 20% / 0.3);
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px hsl(220 15% 20% / 0.4);
}

@media (max-width: 768px) {
  .matchmaking-card {
    flex-direction: column;
    gap: var(--size-4);
    text-align: center;
  }

  .matchmaking-actions {
    justify-content: center;
  }
}
</style>
