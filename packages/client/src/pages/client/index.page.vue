<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import { api, GIFT_STATES } from '@game/api';
import { useMe } from '@/auth/composables/useMe';
import GodlIcon from '@/player/components/GodlIcon.vue';
import PlayerBadge from '@/player/components/PlayerBadge.vue';
import MainMenu from './MainMenu.vue';
import PremiumGemIcon from '@/player/components/PremiumGemIcon.vue';
import { useGifts } from '@/player/composables/useGifts.js';
import { useLogout } from '@/auth/composables/useLogout.js';
definePage({
  name: 'ClientHome',
  meta: {
    requiresAuth: true
  }
});

const { data: unopenedPacks } = useAuthedQuery(api.cards.unopenedPacks, {});

const boosterPackButtonLabel = computed(() => {
  return unopenedPacks.value?.packs.length > 1
    ? `${unopenedPacks.value.packs.length} packs available`
    : `${unopenedPacks.value.packs.length} pack available`;
});

const { data: me } = useMe();

const { data: gifts } = useGifts();
const unclaimedGiftsCount = computed(() => {
  return (
    gifts.value?.filter(gift => gift.state === GIFT_STATES.ISSUED).length ?? 0
  );
});

const { mutate: logout } = useLogout();
</script>

<template>
  <div class="client-home-page">
    <MainMenu />

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

    <PlayerBadge
      v-if="me"
      :name="me.username"
      class="flex gap-3 absolute top-4 left-8"
    />

    <div v-if="me" class="currencies absolute top-6 right-8">
      <GodlIcon />
      <span class="dual-text" :data-text="me.wallet.gold">
        {{ me.wallet.gold }}
      </span>
      <PremiumGemIcon />
      <span class="dual-text" :data-text="me.wallet.premium">
        {{ me.wallet.premium }}
      </span>
    </div>

    <div class="bottom-menu">
      <!-- <button class="menu" /> -->
      <RouterLink :to="{ name: 'Gifts' }" class="gifts">
        <span class="gift-chip" v-if="unclaimedGiftsCount > 0">
          {{ unclaimedGiftsCount }}
        </span>
      </RouterLink>
      <button class="friends" />
      <button class="settings" />
      <button class="logout" @click="logout({})" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.client-home-page {
  transform-style: preserve-3d;
  perspective: 1300px;
  height: 100dvh;
  z-index: 0;
  background: url('@/assets/backgrounds/main-menu-overlay.png');
  background-size: 100% 100%;
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
  background: #000000aa;
  padding: var(--size-2) var(--size-3);
  border-radius: var(--radius-pill);
}

.bottom-menu {
  position: absolute;
  bottom: var(--size-9);
  right: var(--size-9);
  display: flex;
  gap: var(--size-6);
  > *:hover {
    filter: brightness(1.3);
  }
}
.gifts {
  width: 64px;
  height: 64px;
  background-image: url('@/assets/icons/gift.png');
  background-size: cover;
  position: relative;
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
  position: absolute;
  top: -10px;
  right: -10px;
  @screen lt-lg {
    font-size: var(--font-size-00);
  }
}

.settings {
  width: 64px;
  height: 64px;
  background-image: url('@/assets/icons/settings.png');
  background-size: cover;
}
.friends {
  width: 64px;
  height: 64px;
  background-image: url('@/assets/icons/friends.png');
  background-size: cover;
}
.logout {
  width: 64px;
  height: 64px;
  background-image: url('@/assets/icons/logout.png');
  background-size: cover;
}
</style>
