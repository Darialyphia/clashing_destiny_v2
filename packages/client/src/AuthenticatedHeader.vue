<script setup lang="ts">
import { useLogout } from './auth/composables/useLogout';
import { useMe } from './auth/composables/useMe';
import { useLeaveMatchmaking } from '@/matchmaking/composables';
import { useAuthedQuery } from '@/auth/composables/useAuth';
import MatchmakingTimer from './matchmaking/components/MatchmakingTimer.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { api, GIFT_STATES } from '@game/api';
import PlayerBadge from './player/components/PlayerBadge.vue';
import GodlIcon from './player/components/GodlIcon.vue';
import { type RouterLinkProps } from 'vue-router';
import { useLeaveLobby } from './lobby/composables/useLobby';
import CraftignShardIcon from './player/components/CraftignShardIcon.vue';

const { backTo = { name: 'ClientHome' } } = defineProps<{
  backTo?: RouterLinkProps['to'];
}>();
const { mutate: logout } = useLogout();
const { data: me } = useMe();
const { mutate: leaveMatchmaking, isLoading: isLeavingMatchmaking } =
  useLeaveMatchmaking();
const { mutate: leaveLobby, isLoading: isLeavingLobby } = useLeaveLobby();

const { data: gifts } = useAuthedQuery(api.gifts.list, {});

const unclaimedGiftsCount = computed(() => {
  return (
    gifts.value?.filter(gift => gift.state === GIFT_STATES.ISSUED).length ?? 0
  );
});

const router = useRouter();
</script>

<template>
  <header class="flex items-center gap-4 surface">
    <FancyButton
      v-if="router.currentRoute.value.name !== 'ClientHome'"
      text="Back"
      size="md"
      :to="backTo"
    />
    <div class="welcome-section">
      <div v-if="me?.currentJoinedMatchmaking" class="matchmaking-status">
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
      <div v-if="me?.currentLobby" class="lobby-status">
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
    </div>
    <nav class="ml-auto">
      <ul class="flex gap-4">
        <li>
          <RouterLink :to="{ name: 'SelectMode' }">Play</RouterLink>
        </li>
        <li class="hot">
          <RouterLink :to="{ name: 'Shop' }">Shop</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Collection' }">Collection</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Gifts' }">
            Gifts
            <span v-if="unclaimedGiftsCount > 0" class="gift-chip">
              {{ unclaimedGiftsCount }}
            </span>
          </RouterLink>
        </li>
        <li>
          <button @click="logout({})">Logout</button>
        </li>
      </ul>
    </nav>

    <div class="currencies" v-if="me">
      <GodlIcon />
      {{ me.wallet.gold }}
      <CraftignShardIcon />
      {{ me.wallet.craftingShards }}
    </div>
    <PlayerBadge v-if="me" :name="me.username" />
  </header>
</template>

<style scoped lang="postcss">
.welcome-section {
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}

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

.matchmaking-name {
  color: #d7ad42;
  font-weight: var(--font-weight-6);
  padding: var(--size-1) var(--size-2);
  background: hsl(45 100% 50% / 0.1);
  border-radius: var(--radius-1);
  border: 1px solid hsl(45 100% 50% / 0.2);
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

li {
  border-radius: var(--radius-2);
  display: grid;
}

li > :is(a, button) {
  padding: var(--size-3);
  width: 12ch;
  text-align: center;
}

li:hover {
  background: hsl(40 60% 60% / 0.15);
}

li.hot {
  position: relative;
  &::after {
    content: 'HOT!';
    position: absolute;
    top: var(--size-2);
    right: 0;
    transform: translate(50%, -50%);
    background-color: var(--red-8);
    color: white;
    font-size: 0.6rem;
    font-weight: var(--font-weight-7);
    padding: 0.1rem 0.4rem;
    border-radius: var(--radius-2);
  }
}

@media (max-width: 768px) {
  .welcome-section {
    display: none;
  }
}

.gift-chip {
  margin-left: var(--size-1);
  padding-left: var(--size-2);
  padding-right: var(--size-2);
  padding-top: var(--size-05);
  padding-bottom: var(--size-05);
  font-size: var(--font-size-0);
  font-weight: 500;
  background-color: var(--red-8);
  color: white;
  border-radius: var(--radius-round);
}

.currencies {
  --pixel-scale: 1;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-weight: var(--font-weight-3);
  padding: var(--size-2) var(--size-3);
  border-left: 1px solid #9f938f;
  border-right: 1px solid #9f938f;
}
</style>
