<script setup lang="ts">
import { useLogout } from './auth/composables/useLogout';
import { useMe } from './auth/composables/useMe';
import { useLeaveMatchmaking } from '@/matchmaking/composables';
import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import MatchmakingTimer from './matchmaking/components/MatchmakingTimer.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { api, GIFT_STATES } from '@game/api';

const { mutate: logout } = useLogout();
const { data: me } = useMe();
const { mutate: leaveMatchmaking, isLoading: isLeavingMatchmaking } =
  useLeaveMatchmaking();
const { mutate: leaveLobby, isLoading: isLeavingLobby } = useAuthedMutation(
  api.lobbies.leave
);

const { data: gifts } = useAuthedQuery(api.gifts.list, {});

const unclaimedGiftsCount = computed(() => {
  return (
    gifts.value?.filter(gift => gift.state === GIFT_STATES.ISSUED).length ?? 0
  );
});

const router = useRouter();
</script>

<template>
  <header class="flex items-center gap-4 surface">
    <FancyButton
      v-if="router.currentRoute.value.name !== 'ClientHome'"
      text="Back"
      size="md"
      @click="router.go(-1)"
    />
    <div class="welcome-section">
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
      <div v-if="me?.currentLobby" class="lobby-status">
        <span class="status-label">In lobby:</span>
        <RouterLink
          :to="{ name: 'Lobby', params: { id: me.currentLobby.id } }"
          class="lobby-name"
        >
          {{ me.currentLobby.name }}
        </RouterLink>
        <FancyButton
          text="Leave"
          variant="error"
          class="leave-button"
          size="sm"
          :isLoading="isLeavingLobby"
          @click="leaveLobby({ lobbyId: me.currentLobby.id })"
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
          <RouterLink :to="{ name: 'Gifts' }">
            Gifts
            <span
              v-if="unclaimedGiftsCount > 0"
              class="ml-1 px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded-full"
            >
              {{ unclaimedGiftsCount }}
            </span>
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'TutorialHome' }">How To Play</RouterLink>
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

.lobby-status {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: 0.85rem;
  flex-wrap: wrap;
}

.lobby-name {
  color: #42d7a8;
  font-weight: var(--font-weight-6);
  padding: var(--size-1) var(--size-2);
  background: hsl(160 100% 50% / 0.1);
  border-radius: var(--radius-1);
  border: 1px solid hsl(160 100% 50% / 0.2);
  text-decoration: none;
  transition: all 0.2s ease;
}

.lobby-name:hover {
  background: hsl(160 100% 50% / 0.15);
  border-color: hsl(160 100% 50% / 0.3);
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
