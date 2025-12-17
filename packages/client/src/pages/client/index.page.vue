<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import UiButton from '@/ui/components/UiButton.vue';
import { api, GIFT_STATES } from '@game/api';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import BlueprintSmallCard from '@/card/components/BlueprintSmallCard.vue';
import BlueprintCard from '@/card/components/BlueprintCard.vue';

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
</script>

<template>
  <div class="client-home-page">
    <AuthenticatedHeader />
    <div class="surface gifts-notification" v-if="unclaimedGiftsCount > 0">
      You have some unclaimed gifts waiting for you !
      <UiButton :to="{ name: 'Gifts' }" class="primary-button">
        View Gifts
      </UiButton>
    </div>
    <div class="card-container">
      <BlueprintSmallCard
        :blueprint="CARDS_DICTIONARY['erina-council-mage']"
        is-foil
        show-stats
      />
      <BlueprintCard
        :blueprint="CARDS_DICTIONARY['spirit-of-arcane']"
        is-foil
      />
      <!-- <BlueprintSmallCard :blueprint="spiritOfArcane" is-foil /> -->
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

.card-container {
  padding: var(--size-8);
  display: flex;
  justify-content: center;
  perspective: 1000px;
  transform-style: preserve-3d;
  gap: var(--size-6);
}
</style>
