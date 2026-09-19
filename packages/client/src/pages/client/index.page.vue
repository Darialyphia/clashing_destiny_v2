<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import { api, GIFT_STATES } from '@game/api';
import { useLogout } from '@/auth/composables/useLogout';
import { useMe } from '@/auth/composables/useMe';
import CraftignShardIcon from '@/player/components/CraftignShardIcon.vue';
import GodlIcon from '@/player/components/GodlIcon.vue';
import PlayerBadge from '@/player/components/PlayerBadge.vue';
definePage({
  name: 'ClientHome',
  meta: {
    requiresAuth: true
  }
});

const { data: gifts } = useAuthedQuery(api.gifts.list, {});

const unclaimedGiftsCount = computed(() => {
  return (
    gifts.value?.filter(gift => gift.state === GIFT_STATES.ISSUED).length ?? 0
  );
});

const { data: unopenedPacks } = useAuthedQuery(api.cards.unopenedPacks, {});

const { mutate: logout } = useLogout();

const boosterPackButtonLabel = computed(() => {
  return unopenedPacks.value?.packs.length > 1
    ? `${unopenedPacks.value.packs.length} packs available`
    : `${unopenedPacks.value.packs.length} pack available`;
});

const { data: me } = useMe();
</script>

<template>
  <div class="client-home-page">
    <!-- <AuthenticatedHeader /> -->
    <!-- <div class="container">
      <div class="surface gifts-notification" v-if="unclaimedGiftsCount > 0">
        You have some unclaimed gifts waiting for you !
        <UiButton :to="{ name: 'Gifts' }" class="primary-button">
          View Gifts
        </UiButton>
      </div>
      <p v-else>You do not have any gift</p>

      <template v-if="me">
        <p v-if="isLoadingUnopenedPacks">Loading unopened packs...</p>
        <p v-else-if="!unopenedPacks.packs.length">You have no pack to open</p>
        <FancyButton
          v-else
          :text="`Open packs (${unopenedPacks.packs.length})`"
          :to="{ name: 'Boosters' }"
        />
      </template>

      <FancyButton text="Learn how to Play" :to="{ name: 'TutorialHome' }" />
    </div> -->

    <ul class="menu">
      <li>
        <RouterLink
          :to="{ name: 'SelectMode' }"
          class="dual-text"
          data-text="Play"
        >
          <span>Play</span>
        </RouterLink>
      </li>
      <li>
        <RouterLink
          :to="{ name: 'Collection' }"
          class="dual-text"
          data-text="Collection"
        >
          Collection
        </RouterLink>
      </li>
      <li class="hot">
        <RouterLink :to="{ name: 'Shop' }" class="dual-text" data-text="Shop">
          Shop
        </RouterLink>
      </li>
      <li>
        <RouterLink :to="{ name: 'Gifts' }" class="dual-text" data-text="Gifts">
          Gifts
          <span v-if="unclaimedGiftsCount > 0" class="gift-chip">
            {{ unclaimedGiftsCount }}
          </span>
        </RouterLink>
      </li>
      <li>
        <button @click="logout({})" class="dual-text" data-text="Logout">
          Logout
        </button>
      </li>
    </ul>

    <RouterLink
      v-if="unopenedPacks?.packs.length > 0"
      class="boosters"
      :to="{ name: 'Boosters' }"
      aria-label="boosters"
    >
      <span class="dual-text" :data-text="boosterPackButtonLabel">
        {{ boosterPackButtonLabel }}
      </span>
    </RouterLink>

    <div class="flex gap-3 absolute top-4 left-8" v-if="me">
      <PlayerBadge :name="me.username">
        <div class="currencies">
          <GodlIcon />
          <span class="dual-text" :data-text="me.wallet.gold">
            {{ me.wallet.gold }}
          </span>
          <CraftignShardIcon />
          <span class="dual-text" :data-text="me.wallet.craftingShards">
            {{ me.wallet.craftingShards }}
          </span>
        </div>
      </PlayerBadge>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.client-home-page {
  transform-style: preserve-3d;
  perspective: 1300px;
  height: 100dvh;
  z-index: 0;
}

.menu {
  --dual-text-stroke-offset-y: -6px;
  position: absolute;
  top: 20%;
  left: var(--size-13);
  font-size: var(--font-size-6);
  font-weight: 700;
  color: transparent;

  :is(a, button):hover {
    filter: brightness(1.3);
  }

  li {
    width: fit-content;
    transition: all 0.3s ease;
    transition-delay: calc(0.05s * var(--child-index));
    @starting-style {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
  li.hot {
    position: relative;
    &::after {
      content: 'HOT!';
      position: absolute;
      top: var(--size-2);
      right: -25px;
      transform: translate(50%, -50%);
      background-color: var(--red-8);
      color: white;
      font-size: 1rem;
      font-weight: var(--font-weight-7);
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-2);
    }
  }
}

.boosters {
  display: block;
  width: 314px;
  height: 219px;
  background-image: url('@/assets/ui/card/v3/boosters.png');
  background-size: cover;
  position: absolute;
  bottom: var(--size-12);
  left: var(--size-13);
  display: grid;
  place-content: center;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  z-index: 0;
  transition: all 0.3s ease;
  &:hover {
    filter: brightness(1.3) drop-shadow(0 0 5px var(--yellow-3));
  }
}

.currencies {
  --pixel-scale: 1;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: var(--font-size-3);
  --dual-text-stroke-offset-y: calc(-1px * var(--pixel-scale));
}
</style>
