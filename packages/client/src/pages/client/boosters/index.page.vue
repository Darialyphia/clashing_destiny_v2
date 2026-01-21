<script setup lang="ts">
import { useAuthedMutation, useAuthedQuery } from '@/auth/composables/useAuth';
import BoosterPackContent from '@/card/components/BoosterPackContent.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { api } from '@game/api';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';

definePage({
  name: 'Boosters',
  meta: {
    requiresAuth: true
  }
});

const { data: unopenedPacks } = useAuthedQuery(api.cards.unopenedPacks, {});

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

const latestPackOpened = ref<
  Array<{
    blueprint: CardBlueprint;
    isFoil: boolean;
  }>
>([]);
</script>

<template>
  <div class="page">
    <BoosterPackContent :cards="latestPackOpened" class="h-screen">
      <template #done>
        <div class="flex gap-2">
          <FancyButton
            class="primary-button"
            size="lg"
            text="Back"
            :to="{ name: 'ClientHome' }"
          />
          <FancyButton
            v-if="unopenedPacks.packs.length"
            class="secondary-button"
            size="lg"
            text="Next pack"
            :isLoading="isOpeningPack"
            @click="openPack({ packId: unopenedPacks.packs[0].id })"
          />
          <FancyButton
            v-else
            class="secondary-button"
            size="lg"
            text="Buy more packs"
            :to="{ name: 'Shop' }"
          />
        </div>
      </template>
    </BoosterPackContent>
  </div>
</template>

<style scoped lang="postcss"></style>
