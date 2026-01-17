<script setup lang="ts">
import { useAuthedQuery } from '@/auth/composables/useAuth';
import AuthenticatedHeader from '@/AuthenticatedHeader.vue';
import BoosterPackContent from '@/card/components/BoosterPackContent.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiButton from '@/ui/components/UiButton.vue';
import { api, GIFT_STATES } from '@game/api';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { StandardBoosterPack } from '@game/engine/src/card/booster/standard.booster-pack';
import { coreSet } from '@game/engine/src/card/sets/core.set';
import type { BoosterPackOptions } from '@game/engine/src/card/booster/booster';

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

const packs = ref<Array<{ blueprintId: string; isFoil: boolean }[]>>([]);
const currentPackContent = computed(() => {
  if (!packs.value.length) return null;
  return packs.value[0].map(card => ({
    blueprint: CARDS_DICTIONARY[card.blueprintId],
    isFoil: card.isFoil
  }));
});
const isOpeningPacks = ref(false);
const boosterPackFactory = new StandardBoosterPack(coreSet.cards);
const packOptions: BoosterPackOptions = {
  packSize: 5,
  blueprintWeightModifier: () => 1,
  rarityWeightModifier: () => 1
};
</script>

<template>
  <div class="client-home-page">
    <AuthenticatedHeader v-if="!isOpeningPacks" />
    <div class="surface gifts-notification" v-if="unclaimedGiftsCount > 0">
      You have some unclaimed gifts waiting for you !
      <UiButton :to="{ name: 'Gifts' }" class="primary-button">
        View Gifts
      </UiButton>
    </div>

    <BoosterPackContent
      v-if="isOpeningPacks && currentPackContent"
      :cards="currentPackContent"
      class="h-screen"
    >
      <template #done>
        <FancyButton
          class="primary-button"
          size="lg"
          :text="
            packs.length > 1
              ? `Next Pack (${packs.length - 1} remaining)`
              : 'Done'
          "
          @click="
            packs.shift();
            if (packs.length === 0) {
              isOpeningPacks = false;
            }
          "
        />
      </template>
    </BoosterPackContent>

    <div class="flex justify-center gap-5 mt-5" v-else>
      <FancyButton
        text="Buy Pack"
        size="lg"
        @click="packs.push(boosterPackFactory.getContents(packOptions))"
      />
      <FancyButton
        :text="`Open Packs (${packs.length})`"
        size="lg"
        :disabled="packs.length === 0"
        @click="isOpeningPacks = true"
      />
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
