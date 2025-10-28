<script setup lang="ts">
import {
  useAuth,
  useAuthedMutation,
  useAuthedQuery
} from '@/auth/composables/useAuth';
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
import UiSwitch from '@/ui/components/UiSwitch.vue';

definePage({
  name: 'Lobby'
});

const route = useRoute<'Lobby'>();
const lobbyId = computed(() => route.params.id as LobbyId);
const { data: me } = useMe();
const {
  data: lobby,
  isLoading,
  error
} = useAuthedQuery(
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

const isOwner = computed(() => lobby.value.ownerId === me.value?.id);

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

const session = useAuth();
const { mutate: updateOptions } = useAuthedMutation(api.lobbies.updateOptions, {
  optimisticUpdate: (store, arg) => {
    const query = store.getQuery(api.lobbies.byId, {
      lobbyId: arg.lobbyId,
      // @ts-expect-error
      sessionId: session.sessionId.value
    });
    if (!query) return;

    store.setQuery(
      api.lobbies.byId,
      {
        lobbyId: arg.lobbyId,
        // @ts-expect-error
        sessionId: session.sessionId.value
      },
      {
        ...query,
        options: {
          ...query.options,
          ...arg.options
        }
      }
    );
    console.log('Optimistic update applied');
  }
});

const disableTurnTimers = computed({
  get: () => lobby.value!.options.disableTurnTimers || false,
  set: (val: boolean) => {
    if (!lobby.value) return;
    updateOptions({
      lobbyId: lobby.value.id,
      options: {
        ...lobby.value.options,
        disableTurnTimers: val
      }
    });
  }
});

const teachingMode = computed({
  get: () => lobby.value!.options.teachingMode || false,
  set: (val: boolean) => {
    if (!lobby.value) return;
    updateOptions({
      lobbyId: lobby.value.id,
      options: {
        ...lobby.value.options,
        teachingMode: val
      }
    });
  }
});

const router = useRouter();
watchEffect(() => {
  if (!isSpectator.value) return;
  if (lobby.value?.gameId && lobby.value?.status === LOBBY_STATUS.ONGOING) {
    router.push({ name: 'WatchGame', params: { id: lobby.value.gameId } });
  }
});
</script>

<template>
  <div class="page" style="--container-size: var(--size-xl)">
    <div v-if="isLoading" class="loader">Loading lobby...</div>

    <div
      v-else-if="error"
      class="h-screen flex flex-col items-center justify-center"
    >
      <p class="c-red-6">{{ (error as any).data }}</p>
      <UiButton class="error-button" :to="{ name: 'Lobbies' }">
        Return to lobbies list
      </UiButton>
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

      <aside class="surface container">
        <div>
          <h2>Chat</h2>
          <LobbyChat :lobby="lobby" />
        </div>

        <div class="sidebar">
          <div class="sidebar-section">
            <div class="section-header">
              <h2 class="section-title">Players</h2>
              <span class="player-count">
                {{ players.length }}/{{ MAX_PLAYERS_PER_LOBBY }}
              </span>
            </div>

            <div class="section-content">
              <p v-if="!players.length" class="empty-state">
                No players in the lobby yet
              </p>
              <ul v-else class="user-list" v-auto-animate>
                <LobbyUserCard
                  v-for="player in players"
                  :key="player.id"
                  :lobby-user="player"
                  :lobby="lobby"
                  :role="LOBBY_USER_ROLES.PLAYER"
                />
              </ul>

              <div class="role-action">
                <LobbyRoleButton :lobby="lobby" />
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="section-header">
              <h2 class="section-title">Spectators</h2>
              <span v-if="spectators.length" class="spectator-count">
                {{ spectators.length }}
              </span>
            </div>

            <div class="section-content">
              <p v-if="!spectators.length" class="empty-state">
                No spectators watching
              </p>
              <ul v-else class="user-list" v-auto-animate>
                <LobbyUserCard
                  v-for="spectator in spectators"
                  :key="spectator.id"
                  :lobby-user="spectator"
                  :lobby="lobby"
                  :role="LOBBY_USER_ROLES.SPECTATOR"
                />
              </ul>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="section-header">
              <h2 class="section-title">Game Options</h2>
              <span v-if="!isOwner" class="readonly-badge">View Only</span>
            </div>

            <div class="section-content">
              <div v-if="isOwner" class="options-grid">
                <div class="option-item">
                  <label class="option-label">
                    <UiSwitch v-model="disableTurnTimers" />
                    <span class="option-title">Disable turn timers</span>
                  </label>
                  <p class="option-description">
                    Players will have unlimited time to perform actions
                  </p>
                </div>

                <div class="option-item">
                  <label class="option-label">
                    <UiSwitch v-model="teachingMode" />
                    <span class="option-title">Teaching mode</span>
                  </label>
                  <p class="option-description">
                    Both players can see each other's hand, destiny zone and
                    destiny deck
                  </p>
                </div>
              </div>

              <div v-else class="options-readonly">
                <div class="readonly-option">
                  <span class="readonly-label">Turn timers:</span>
                  <span
                    class="readonly-value"
                    :class="{
                      enabled: !lobby.options.disableTurnTimers,
                      disabled: lobby.options.disableTurnTimers
                    }"
                  >
                    {{
                      lobby.options.disableTurnTimers ? 'Disabled' : 'Enabled'
                    }}
                  </span>
                </div>

                <div class="readonly-option">
                  <span class="readonly-label">Teaching mode:</span>
                  <span
                    class="readonly-value"
                    :class="{
                      enabled: lobby.options.teachingMode,
                      disabled: !lobby.options.teachingMode
                    }"
                  >
                    {{ lobby.options.teachingMode ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Section -->
          <div class="sidebar-section sidebar-footer">
            <LobbyFooter :lobby="lobby" />
          </div>
        </div>
      </aside>
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
}

.loader {
  display: grid;
  grid-row: 1 / -1;
  place-content: center;

  width: 100%;
  height: 100%;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--size-6);
  padding-top: var(--size-8);
}

/* Sidebar Section Structure */
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: var(--size-4);
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-2);
}

.section-title {
  font-size: var(--font-size-3);
  font-weight: 600;
  margin: 0;
  color: var(--text-color-primary, inherit);
}

.player-count,
.spectator-count {
  font-size: var(--font-size-1);
  font-weight: 500;
  padding: var(--size-1) var(--size-2);
  background: var(--surface-3, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-2);
  color: var(--text-color-secondary, rgba(255, 255, 255, 0.8));
}

.readonly-badge {
  font-size: var(--font-size-0);
  font-weight: 500;
  padding: var(--size-1) var(--size-2);
  background: var(--orange-6, #f59e0b);
  color: var(--orange-1, #fef3c7);
  border-radius: var(--radius-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Section Content */
.section-content {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

/* User Lists */
.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.empty-state {
  font-size: var(--font-size-1);
  color: var(--text-color-secondary, rgba(255, 255, 255, 0.6));
  font-style: italic;
  text-align: center;
  padding: var(--size-4);
  background: var(--surface-2, rgba(255, 255, 255, 0.05));
  border-radius: var(--radius-2);
  margin: 0;
}

/* Role Action */
.role-action {
  padding-top: var(--size-2);
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
}

/* Game Options */
.options-grid {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
}

.option-label {
  display: flex;
  align-items: center;
  gap: var(--size-2);
  cursor: pointer;
  font-weight: 500;
}

.option-title {
  color: var(--text-color-primary, inherit);
}

.option-description {
  font-size: var(--font-size-1);
  color: var(--text-color-secondary, rgba(255, 255, 255, 0.7));
  margin: 0;
  padding-left: calc(var(--size-5) + var(--size-2)); /* Align with switch */
  line-height: 1.4;
}

/* Readonly Options */
.options-readonly {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.readonly-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--size-3);
  background: var(--surface-2, rgba(255, 255, 255, 0.05));
  border-radius: var(--radius-2);
}

.readonly-label {
  font-weight: 500;
  color: var(--text-color-primary, inherit);
}

.readonly-value {
  font-size: var(--font-size-1);
  font-weight: 600;
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.readonly-value.enabled {
  background: var(--green-6, #10b981);
  color: var(--green-1, #d1fae5);
}

.readonly-value.disabled {
  background: var(--red-6, #ef4444);
  color: var(--red-1, #fee2e2);
}

/* Main Layout */
h2 {
  font-size: var(--font-size-3);
}

aside {
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
