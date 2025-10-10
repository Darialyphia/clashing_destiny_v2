<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import LobbyForm from './LobbyForm.vue';
import { useMe } from '@/auth/composables/useMe';
import { api } from '@game/api';
import { Icon } from '@iconify/vue';
import UiButton from '@/ui/components/UiButton.vue';

definePage({
  name: 'Lobbies'
});

const { data: lobbies, isLoading } = useAuthedQuery(api.lobbies.list, {});
const { data: me } = useMe();
</script>

<template>
  <div class="page" v-if="me">
    <AuthenticatedHeader />
    <div class="grid container">
      <section class="surface">
        <h2>Lobbies</h2>
        <div v-if="isLoading">Loading lobbies...</div>
        <div v-else-if="!lobbies.length">
          There are no lobbies available right now.
        </div>
        <ul v-else>
          <li
            v-for="lobby in lobbies"
            :key="lobby.id"
            class="flex justify-between items-center"
          >
            <div>
              <div class="font-semibold flex items-center gap-1">
                <Icon v-if="lobby.needsPassword" icon="material-symbols:lock" />
                {{ lobby.name }}
              </div>
            </div>
            <div>{{ lobby.status }}</div>

            <div class="flex items-center gap-2">
              <Icon icon="mdi:user" class="text-3 c-primary" />
              {{ lobby.playerCount }}
            </div>
            <UiButton
              :disabled="me.currentLobby && me.currentLobby.id !== lobby.id"
              class="primary-button"
              left-icon="fluent-emoji-high-contrast:crossed-swords"
              :to="{ name: 'Lobby', params: { id: lobby.id } }"
            >
              Join
            </UiButton>
          </li>
        </ul>
      </section>
      <aside class="surface">
        <h2>Create a new lobby</h2>

        <LobbyForm />
      </aside>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.page {
  display: grid;
  grid-template-rows: auto 1fr;

  height: 100dvh;
  padding-top: var(--size-2);
  padding-inline: var(--size-5);
}

h2 {
  font-size: var(--font-size-4);
}
.grid {
  display: grid;
  grid-template-columns: 1fr var(--size-14);
  gap: var(--size-3);
}

li {
  margin-block: var(--size-4);
  padding: var(--size-4);
  border: solid var(--border-size-1) var(--border-dimmed);
}
</style>
