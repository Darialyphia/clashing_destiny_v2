<script setup lang="ts">
import { useAuthedMutation } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import { useDecks } from '@/card/composables/useDecks';
import { api, type LobbyDetails } from '@game/api';
import UiDrawer from '@/ui/components/UiDrawer.vue';
import PlayerDeck from '@/player/components/PlayerDeck.vue';

const { lobby } = defineProps<{ lobby: LobbyDetails }>();
const isOpened = defineModel<boolean>('isOpened', { required: true });

const { data: decks } = useDecks();

const { mutate: selectLoadout } = useAuthedMutation(api.lobbies.selectDeck);
const { data: me } = useMe();

const myLobbyUser = computed(
  () =>
    lobby.players.find(u => u.userId === me.value?.id) ||
    lobby.spectators.find(u => u.userId === me.value?.id)
);

const selectedDeckId = computed({
  get() {
    // @ts-expect-error too lazy to fix this bs
    return myLobbyUser.value!.deckId;
  },
  set(val) {
    selectLoadout({ lobbyId: lobby.id, deckId: val });
  }
});
</script>

<template>
  <UiDrawer
    v-model:is-opened="isOpened"
    direction="right"
    title="Select your deck"
  >
    <div class="surface min-h-screen">
      <p v-if="!decks.length">
        You have no valid deck in this format.
        <br />
        <RouterLink :to="{ name: 'Collection' }" class="c-primary underline">
          Go to collection
        </RouterLink>
      </p>
      <button
        v-for="deck in decks"
        :key="deck.id"
        class="w-full my-2"
        @click="
          () => {
            selectedDeckId = deck.id;
            isOpened = false;
          }
        "
      >
        <PlayerDeck :deck="deck" />
      </button>
    </div>
  </UiDrawer>
</template>
