<script setup lang="ts">
import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import BoosterPackContent from '@/card/components/BoosterPackContent.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiButton from '@/ui/components/UiButton.vue';
import { api, GIFT_STATES } from '@game/api';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { useMe } from '@/auth/composables/useMe';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';

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

const { mutate: openPack, isLoading: isOpeningPack } = useAuthedMutation(
  api.cards.openPack,
  {
    onSuccess(data) {
      latestPackOpened.value = data.cards.map(card => ({
        blueprint: CARDS_DICTIONARY[card.blueprintId],
        isFoil: card.isFoil
      }));
    }
  }
);
const latestPackOpened = ref<Array<{
  blueprint: CardBlueprint;
  isFoil: boolean;
}> | null>(null);
</script>

<template>
  <div class="client-home-page">
    <AuthenticatedHeader v-if="!latestPackOpened" />
    <div class="surface gifts-notification" v-if="unclaimedGiftsCount > 0">
      You have some unclaimed gifts waiting for you !
      <UiButton :to="{ name: 'Gifts' }" class="primary-button">
        View Gifts
      </UiButton>
    </div>

    <BoosterPackContent
      v-if="latestPackOpened"
      :cards="latestPackOpened"
      class="h-screen"
    >
      <template #done>
        <FancyButton
          class="primary-button"
          size="lg"
          text="Back to home"
          @click="latestPackOpened = null"
        />
      </template>
    </BoosterPackContent>

    <div v-else-if="me" class="container">
      <p v-if="isLoadingUnopenedPacks">Loading unopened packs...</p>
      <p v-else-if="!unopenedPacks.packs.length">You have no pack to open</p>
      <template v-else>
        <ul class="flex flex-wrap gap-3">
          <li
            v-for="pack in unopenedPacks.packs"
            :key="pack.id"
            class="flex gap-4 items-center text-4 my-3 surface"
          >
            {{ pack.packName }}
            <FancyButton
              text="Open"
              :disabled="isOpeningPack"
              @click="openPack({ packId: pack.id })"
            />
          </li>
        </ul>
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
