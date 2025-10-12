<script setup lang="ts">
import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import FancyButton from '@/ui/components/FancyButton.vue';
import { api, GIFT_STATES } from '@game/api';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';

definePage({
  name: 'Gifts'
});

const { isLoading, data: gifts } = useAuthedQuery(api.gifts.list, {});

const { mutate: claim } = useAuthedMutation(api.gifts.claim);
</script>

<template>
  <div class="gifts-page">
    <AuthenticatedHeader />

    <div v-if="isLoading" class="loading-state">Loading your gifts...</div>

    <div
      v-else
      class="container"
      :style="{ '--container-size': 'var(--size-md)' }"
    >
      <h2 class="my-6">Your Gifts</h2>
      <ul v-if="gifts && gifts.length > 0" class="flex flex-col gap-4">
        <li
          v-for="gift in gifts"
          :key="gift.id"
          class="surface flex gap-4 items-center"
        >
          <div>{{ gift.name }}</div>
          <FancyButton
            v-if="gift.state === GIFT_STATES.ISSUED"
            text="Claim"
            class="ml-auto"
            @click="claim({ giftId: gift.id })"
          />
          <div v-else-if="gift.state === GIFT_STATES.CLAIMED" class="ml-auto">
            Claimed
          </div>
        </li>
      </ul>
      <div v-else class="empty-state">You have no gifts at the moment.</div>
    </div>
  </div>
</template>
