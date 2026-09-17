<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import { api, GIFT_STATES } from '@game/api';
import { useMe } from '@/auth/composables/useMe';
import { useLogout } from '@/auth/composables/useLogout';

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

const { data: me } = useMe();
const { data: unopenedPacks, isLoading: isLoadingUnopenedPacks } =
  useAuthedQuery(api.cards.unopenedPacks, {});

const { mutate: logout } = useLogout();

const boosterPackButtonLabel = computed(() => {
  return unopenedPacks.value?.packs.length > 1
    ? `${unopenedPacks.value.packs.length} packs available`
    : `${unopenedPacks.value.packs.length} pack available`;
});
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
      v-if="unopenedPacks.packs?.length > 0"
      class="boosters"
      :to="{ name: 'Boosters' }"
      aria-label="boosters"
    >
      <span class="dual-text" :data-text="boosterPackButtonLabel">
        {{ boosterPackButtonLabel }}
      </span>
    </RouterLink>
  </div>
</template>

<style scoped lang="postcss">
.gifts-notification {
  margin-block-start: var(--size-8);
  display: flex;
  gap: var(--size-5);
  align-items: center;
  font-size: var(--size-4);
  width: fit-content;
  margin-inline: auto;
}

.client-home-page {
  transform-style: preserve-3d;
  perspective: 1300px;
  height: 100dvh;
  z-index: 0;
}

.menu {
  --dual-text-stroke-offset-y: -2px;
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
</style>
