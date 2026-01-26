<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import {
  LOBBY_USER_ROLES,
  MAX_PLAYERS_PER_LOBBY,
  type LobbyDetails
} from '@game/api';
import UiButton from '@/ui/components/UiButton.vue';
import { useChangeLobbyRole } from '@/lobby/composables/useLobby';

const { lobby } = defineProps<{ lobby: LobbyDetails }>();

const { mutate: changeRole } = useChangeLobbyRole();
const { data: me } = useMe();

const isPlayer = computed(() =>
  lobby.players.some(u => u.userId === me.value?.id)
);
</script>

<template>
  <UiButton
    v-if="!isPlayer"
    class="ghost-button"
    :disabled="lobby.players.length === MAX_PLAYERS_PER_LOBBY"
    left-icon="material-symbols:switch-access-shortcut"
    @click="
      changeRole({
        newRole: LOBBY_USER_ROLES.PLAYER,
        lobbyId: lobby.id,
        targetUserId: me?.id
      })
    "
  >
    Switch to player
  </UiButton>
  <UiButton
    v-if="isPlayer"
    class="ghost-button switch-to-spectator"
    left-icon="material-symbols:switch-access-shortcut"
    @click="
      changeRole({
        newRole: LOBBY_USER_ROLES.SPECTATOR,
        lobbyId: lobby.id,
        targetUserId: me.id
      })
    "
  >
    Switch to spectator
  </UiButton>
</template>

<style scoped lang="postcss">
.switch-to-spectator:deep(svg) {
  rotate: 180deg;
}
</style>
