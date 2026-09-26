<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import { useLeaveMatchmaking } from '@/matchmaking/composables';
import FancyButton from '@/ui/components/FancyButton.vue';
import MatchmakingTimer from '@/matchmaking/components/MatchmakingTimer.vue';
import { useLeaveLobby } from '@/lobby/composables/useLobby';

const { data: me } = useMe();

const { mutate: leaveMatchmaking, isLoading: isLeavingMatchmaking } =
  useLeaveMatchmaking();

const { mutate: leaveLobby, isLoading: isLeavingLobby } = useLeaveLobby();

const route = useRoute();
</script>

<template>
  <div
    v-if="me?.currentJoinedMatchmaking && route.name !== 'Matchmaking'"
    class="matchmaking-status surface"
  >
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
  <div
    v-if="me?.currentLobby && route.name !== 'Lobby'"
    class="lobby-status surface"
  >
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
</template>

<style scoped lang="postcss">
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
</style>
