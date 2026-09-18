<script setup lang="ts">
import { useAuthedMutation } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import {
  api,
  CRAFTING_COST_PER_RARITY,
  DECRAFTING_REWARD_PER_RARITY,
  FOIL_CRAFTING_COST_MULTIPLIER,
  FOIL_DECRAFTING_REWARD_MULTIPLIER,
  type CardId
} from '@game/api';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiSpinner from '@/ui/components/UiSpinner.vue';
import CraftignShardIcon from '@/player/components/CraftignShardIcon.vue';
const { card } = defineProps<{
  card: {
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  };
}>();

const { data: me } = useMe();

const craftingCost = computed(() => {
  return CRAFTING_COST_PER_RARITY[card.card.rarity];
});

const decraftingReward = computed(() => {
  const multiplier = card.isFoil ? FOIL_DECRAFTING_REWARD_MULTIPLIER : 1;
  return DECRAFTING_REWARD_PER_RARITY[card.card.rarity] * multiplier;
});

const { mutate: craft, isLoading: isCrafting } = useAuthedMutation(
  api.cards.craft,
  {
    onSuccess: () => {}
  }
);

const { mutate: decraft, isLoading: isDecrafting } = useAuthedMutation(
  api.cards.decraft,
  {
    onSuccess: () => {}
  }
);
</script>

<template>
  <footer class="card-details-modal-footer">
    <FancyButton
      :text="`Craft (${craftingCost * (card.isFoil ? FOIL_CRAFTING_COST_MULTIPLIER : 1)})`"
      :disabled="isCrafting || isDecrafting"
      size="sm"
      @click="craft({ blueprintId: card.card.id, isFoil: card.isFoil })"
    >
      <template #left>
        <CraftignShardIcon />
      </template>

      <template v-if="isCrafting" #right>
        <UiSpinner size="5" />
      </template>
    </FancyButton>

    <FancyButton
      :text="`Disenchant (${decraftingReward})`"
      :disabled="card.copiesOwned === 0 || isCrafting || isDecrafting"
      size="sm"
      variant="error"
      @click="decraft({ cardId: card.id as CardId, amount: 1 })"
    >
      <template #left>
        <CraftignShardIcon />
      </template>

      <template v-if="isDecrafting" #right>
        <UiSpinner size="5" />
      </template>
    </FancyButton>
  </footer>
  <p>Your Shards: {{ me?.wallet.craftingShards ?? 0 }}</p>
</template>

<style scoped lang="postcss">
.card-details-modal-footer {
  --pixel-scale: 1;
  margin-block-start: auto;
  padding-block-start: var(--size-4);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--size-3);
  justify-content: center;
  border-block-start: var(--border-size-1) solid var(--border-dimmed);
  > button {
    width: 100%;
  }
}
</style>
