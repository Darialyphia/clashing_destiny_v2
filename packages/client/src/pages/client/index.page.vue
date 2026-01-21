<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiButton from '@/ui/components/UiButton.vue';
import { api, GIFT_STATES } from '@game/api';
import { useMe } from '@/auth/composables/useMe';

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
</script>

<template>
  <div class="client-home-page">
    <AuthenticatedHeader />
    <div class="container">
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
    </div>
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
}
</style>
