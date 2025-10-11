<script setup lang="ts">
import { useAuthedMutation } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import { useDecks } from '@/card/composables/useDecks';
import PlayerDeck from '@/player/components/PlayerDeck.vue';
import {
  api,
  LOBBY_USER_ROLES,
  type DeckId,
  type LobbyDetails,
  type LobbyUserRole,
  type UserId
} from '@game/api';
import { Icon } from '@iconify/vue';
import UiIconButton from '@/ui/components/UiIconButton.vue';
import UiButton from '@/ui/components/UiButton.vue';
import LobbyDeckDrawer from './LobbyDeckDrawer.vue';

const { lobbyUser, lobby, role } = defineProps<{
  lobby: LobbyDetails;
  lobbyUser: { userId: UserId; username: string; deckId?: DeckId };
  role: LobbyUserRole;
}>();

const { data: me } = useMe();
const isMe = computed(() => me.value.id === lobbyUser.userId);
const isOwner = computed(() => lobby.ownerId === lobbyUser.userId);

const { data: decks } = useDecks();
const { mutate: selectDeck } = useAuthedMutation(api.lobbies.selectDeck);

const selectedDeck = computed(() =>
  decks.value?.find(d => d.id === lobbyUser.deckId)
);

const isLoadoutDrawerOpened = ref(false);
</script>

<template>
  <li class="lobby-user">
    <Icon :class="!isOwner && 'opacity-0'" icon="mdi:crown" class="c-primary" />
    <Icon
      v-if="lobbyUser.deckId"
      icon="material-symbols:check"
      class="c-green-6"
    />
    {{ lobbyUser.username }}

    <template v-if="isMe">
      <template v-if="selectedDeck">
        <button class="w-full">
          <PlayerDeck
            :deck="selectedDeck"
            @click="isLoadoutDrawerOpened = true"
          />
        </button>
        <UiIconButton
          icon="mdi:close"
          class="c-red-6"
          @click="selectDeck({ lobbyId: lobby.id, deckId: undefined })"
        />
      </template>
      <UiButton
        v-else-if="role === LOBBY_USER_ROLES.PLAYER"
        class="primary-button"
        @click="isLoadoutDrawerOpened = true"
      >
        Select your deck
      </UiButton>

      <LobbyDeckDrawer
        v-model:is-opened="isLoadoutDrawerOpened"
        :lobby="lobby"
      />
    </template>

    <template v-else>
      <!-- <p v-if="lobbyUser.presence === 'offline'" class="c-error">
        This player is offline
      </p> -->
      <p v-if="!lobbyUser.deckId && role === LOBBY_USER_ROLES.PLAYER">
        Choosing deck...
      </p>
    </template>
  </li>
</template>

<style scoped lang="postcss">
.lobby-user {
  display: flex;
  gap: var(--size-2);
  align-items: center;

  margin-block: var(--size-2);

  font-size: var(--font-size-2);
  font-weight: var(--font-weight-5);
  > img {
    overflow: hidden;
    border-radius: var(--radius-round);
  }
  > img,
  > svg {
    flex-shrink: 0;
  }

  &.offline {
    opacity: 0.5;
  }
}
</style>
