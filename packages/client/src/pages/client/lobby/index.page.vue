<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
// import { useMe } from '@/auth/composables/useMe';
import { api } from '@game/api';
import { Icon } from '@iconify/vue';

definePage({
  name: 'Lobbies'
});

const { data: lobbies, isLoading } = useAuthedQuery(api.lobbies.list, {});
// const { data: me } = useMe();
</script>

<template>
  <div class="page container">
    <AuthenticatedHeader />
    <div class="grid">
      <section class="fancy-surface">
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
              <div class="font-semibold">
                <Icon v-if="lobby.needsPassword" icon="material-symbols:lock" />
                {{ lobby.name }}
              </div>
            </div>
            <div>{{ lobby.status }}</div>

            <div>
              <Icon icon="mdi:user" class="text-3 c-primary" />
              {{ lobby.playerCount }}
            </div>
            <!-- <NuxtLink
              v-slot="{ href, navigate }"
              :to="{ name: 'Lobby', params: { id: lobby._id } }"
              custom
            >
              <UiButton
                :disabled="me.currentLobby && me.currentLobby !== lobby._id"
                class="primary-button"
                left-icon="fluent-emoji-high-contrast:crossed-swords"
                :href="
                  me.currentLobby && me.currentLobby !== lobby._id
                    ? undefined
                    : href
                "
                @click="navigate"
              >
                Join
              </UiButton>
            </NuxtLink> -->
          </li>
        </ul>
      </section>
      <aside class="fancy-surface">
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

  @screen lg {
    padding-block: var(--size-10) var(--size-8);
  }
}

h2 {
  font-size: var(--font-size-4);
}
.grid {
  display: grid;
  grid-template-columns: 1fr var(--size-14);
  gap: var(--size-3);
}

aside {
  padding-inline: var(--size-3);
}

li {
  margin-block: var(--size-4);
  padding: var(--size-4);
  border: solid var(--border-size-1) var(--border-dimmed);
}
</style>
