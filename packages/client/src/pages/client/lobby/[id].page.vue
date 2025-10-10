<script setup lang="ts">
import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import {
  api,
  LOBBY_STATUS,
  LOBBY_USER_ROLES,
  MAX_PLAYERS_PER_LOBBY,
  type LobbyId
} from '@game/api';
import { until } from '@vueuse/core';
import LobbyUserCard from './LobbyUserCard.vue';
import UiTextInput from '@/ui/components/UiTextInput.vue';
import UiButton from '@/ui/components/UiButton.vue';
import UiModal from '@/ui/components/UiModal.vue';
import LobbyRoleButton from './LobbyRoleButton.vue';
import LobbyChat from './LobbyChat.vue';
import LobbyFooter from './LobbyFooter.vue';

definePage({
  name: 'Lobby'
});

const route = useRoute<'Lobby'>();
const lobbyId = computed(() => route.params.id as LobbyId);
const { data: me } = useMe();
const { data: lobby, isLoading } = useAuthedQuery(
  api.lobbies.byId,
  computed(() => ({
    lobbyId: lobbyId.value
  }))
);

const players = computed(() => lobby.value.players);
const spectators = computed(() => lobby.value.spectators);
const myLobbyUser = computed(
  () =>
    lobby.value?.players.find(u => u.userId === me.value?.id) ||
    lobby.value?.spectators.find(u => u.userId === me.value?.id)
);
const isSpectator = computed(() =>
  lobby.value?.spectators.some(u => u.userId === me.value?.id)
);

const { mutate: join, error: joinError } = useAuthedMutation(
  api.lobbies.join,
  {}
);

until(lobby)
  .toBeTruthy()
  .then(lobby => {
    if (myLobbyUser.value) return;
    if (lobby.needsPassword) return;
    join({
      lobbyId: lobbyId.value
    });
  });

watchEffect(() => {
  if (!isSpectator.value) return;
  if (lobby.value?.gameId && lobby.value?.status === LOBBY_STATUS.ONGOING) {
    // @TODO handle spectator more when the feature is implemented
  }
});

const password = ref('');
</script>

<template>
  <div class="page container" style="--container-size: var(--size-xl)">
    <div
      v-if="isLoading || (!myLobbyUser && !lobby.needsPassword)"
      class="loader"
    >
      Loading lobby...
    </div>

    <UiModal
      v-else-if="!myLobbyUser && lobby.needsPassword"
      :is-opened="true"
      title="Protected Lobby"
      description="This lobby needs a password"
    >
      <p class="mb-5">
        This Lobby is private. Pleas enter the password below to access it.
      </p>

      <form @submit.prevent="join({ lobbyId: lobby.id, password })">
        <UiTextInput id="password" v-model="password" type="password" />
        <UiButton class="primary-button my-5">Join</UiButton>
        <p v-if="joinError" class="c-red-6">{{ joinError.message }}</p>
      </form>
    </UiModal>

    <template v-else-if="lobby">
      <AuthenticatedHeader />

      <section class="surface">
        <div>
          <h2>Chat</h2>
          <LobbyChat :lobby="lobby" />
        </div>

        <div class="flex flex-col pt-8">
          <h2>Format</h2>
          <div class="flex items-center text-3 mb-4">
            <!-- <LobbyFormatDetails :lobby="lobby" /> -->
          </div>

          <h2>Players ({{ players.length }}/{{ MAX_PLAYERS_PER_LOBBY }})</h2>
          <p v-if="!players.length">There are no players at the moment.</p>
          <ul v-auto-animate>
            <LobbyUserCard
              v-for="player in players"
              :key="player.id"
              :lobby-user="player"
              :lobby="lobby"
              :role="LOBBY_USER_ROLES.PLAYER"
            />
          </ul>

          <LobbyRoleButton :lobby="lobby" />

          <h2 class="mt-5">Spectators</h2>
          <p v-if="!spectators.length">
            There are no spectators at the moment.
          </p>
          <ul v-auto-animate>
            <LobbyUserCard
              v-for="spectator in spectators"
              :key="spectator.id"
              :lobby-user="spectator"
              :lobby="lobby"
              :role="LOBBY_USER_ROLES.SPECTATOR"
            />
          </ul>

          <LobbyFooter :lobby="lobby" />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="postcss">
.page {
  overflow-y: hidden;
  display: grid;
  grid-template-rows: auto 1fr;

  gap: var(--size-6);

  height: 100dvh;
  padding-inline: var(--size-5);

  > header {
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;
  }
}

.loader {
  display: grid;
  grid-row: 1 / -1;
  place-content: center;

  width: 100%;
  height: 100%;
}
h2 {
  font-size: var(--font-size-3);
}

section {
  overflow-y: hidden;
  display: grid;
  grid-template-columns: 1fr var(--size-sm);
  gap: var(--size-3);

  height: 100%;
  > div {
    padding: var(--size-2);
  }
  > div:first-of-type {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    gap: var(--size-3);

    height: 100%;
  }
}
</style>
