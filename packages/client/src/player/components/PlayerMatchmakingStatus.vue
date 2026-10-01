<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import { useLeaveMatchmaking } from '@/matchmaking/composables';
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
    <div class="matchmaking-icon" />
    <div class="matchmaking-name">
      <span>In Queue</span>
      <MatchmakingTimer
        v-if="me.currentJoinedMatchmaking.joinedAt"
        :joinedAt="me.currentJoinedMatchmaking.joinedAt"
      />
    </div>
    <button
      aria-label="Leave"
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
    <div class="lobby-icon" />

    <div class="lobby-infos">
      <span>In Queue</span>
      <div class="lobby-name">
        {{ me.currentLobby.name }}
      </div>
    </div>
    <div class="flex gap-2">
      <RouterLink
        aria-label="Go to Lobby"
        :to="{ name: 'Lobby', params: { id: me.currentLobby.id } }"
        class="lobby-back-button"
      />

      <button
        aria-label="Leave"
        variant="error"
        class="leave-button"
        size="sm"
        :isLoading="isLeavingLobby"
        @click="leaveLobby({ lobbyId: me.currentLobby.id })"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.matchmaking-status {
  display: flex;
  align-items: center;
  gap: var(--size-5);
  flex-wrap: wrap;
  padding: var(--size-4);
}

.matchmaking-icon {
  width: 48px;
  aspect-ratio: 1;
  background: url('@/assets/ui/matchmaking-status.png') no-repeat center center;
}

.matchmaking-name {
  color: var(--blue-3);
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  line-height: 1.2;
}

.lobby-status {
  display: flex;
  align-items: center;
  gap: var(--size-5);
  padding: var(--size-4);
}

.lobby-icon {
  width: 48px;
  aspect-ratio: 1;
  background: url('@/assets/ui/lobby-status.png') no-repeat center center;
}

.lobby-infos {
  color: var(--yellow-3);
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  line-height: 1.2;
  display: flex;
  flex-direction: column;
}

.lobby-name {
  color: var(--gray-1);
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-4);
}

.leave-button {
  width: 39px;
  aspect-ratio: 1;
  background: url('@/assets/ui/button-close.png') no-repeat center center;
  &:hover:not(:disabled) {
    filter: brightness(1.5);
  }
}

.lobby-back-button {
  width: 39px;
  aspect-ratio: 1;
  background: url('@/assets/ui/button-back.png') no-repeat center center;
  &:hover:not(:disabled) {
    filter: brightness(1.5);
  }
}
</style>
