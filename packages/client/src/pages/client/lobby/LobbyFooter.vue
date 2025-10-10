<script setup lang="ts">
import { useAuthedMutation } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import { api } from '@game/api';
import {
  LOBBY_STATUS,
  MAX_PLAYERS_PER_LOBBY,
  type LobbyDetails
} from '@game/api';
import UiButton from '@/ui/components/UiButton.vue';

const { lobby } = defineProps<{ lobby: LobbyDetails }>();
const { data: me } = useMe();
const router = useRouter();

const isOwner = computed(() => lobby.ownerId === me.value.id);

const { mutate: start, isLoading: isStarting } = useAuthedMutation(
  api.lobbies.start
);

const { mutate: leaveLobby, isLoading: isLeaving } = useAuthedMutation(
  api.lobbies.leave,
  {
    onSuccess() {
      router.push({ name: 'Lobbies' });
    }
  }
);

const isReady = computed(() => {
  const isFull = lobby.players.length === MAX_PLAYERS_PER_LOBBY;
  const playersHaveChosenDecks = lobby.players.every(p => p.deckId);

  return isFull && playersHaveChosenDecks;
});
</script>

<template>
  <footer class="flex mt-auto">
    <div v-if="isOwner" class="start-wrapper" :class="isReady && 'is-ready'">
      <UiButton
        class="primary-button"
        :disabled="!isReady"
        :is-loading="isStarting || lobby.status === LOBBY_STATUS.CREATING_GAME"
        @click="start({ lobbyId: lobby.id })"
      >
        Start game
      </UiButton>
    </div>
    <UiButton
      :is-loading="isLeaving"
      class="error-button ml-auto"
      @click="leaveLobby({ lobbyId: lobby.id })"
    >
      Leave lobby
    </UiButton>
  </footer>
</template>

<style scoped lang="postcss">
@property --lobby-footer-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes lobby-ready {
  to {
    --lobby-footer-angle: 360deg;
  }
}

.start-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2px;

  border: 3px solid #0000;
  border-radius: 12px;

  &.is-ready {
    background: linear-gradient(
        var(--lobby-footer-angle),
        transparent,
        var(--primary-dark)
      )
      border-box;
    animation: 4s lobby-ready linear infinite;
  }
}
</style>
