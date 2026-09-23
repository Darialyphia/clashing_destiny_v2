<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import { type CardId } from '@game/api';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiSpinner from '@/ui/components/UiSpinner.vue';
import CraftignShardIcon from '@/player/components/CraftignShardIcon.vue';
import { useCrafting } from '@/card/composables/useCrafting';
import { useResponsive } from '@/shared/composables/useResponsive';

const { card } = defineProps<{
  card: {
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  };
}>();

const { data: me } = useMe();

const {
  craftingCost,
  decraftingReward,
  upgradeCost,
  craft,
  isCrafting,
  decraft,
  isDecrafting,
  upgrade,
  isUpgrading,
  canUpgrade
} = useCrafting(computed(() => card));

const { isSmallViewport } = useResponsive();
</script>

<template>
  <footer class="card-details-modal-footer">
    <FancyButton
      v-if="canUpgrade"
      :text="
        isSmallViewport
          ? `Upgrade (${upgradeCost})`
          : `Upgrade to Foil (${upgradeCost})`
      "
      :disabled="isCrafting || isDecrafting || isUpgrading"
      size="sm"
      @click="upgrade({ cardId: card.id as CardId })"
    >
      <template #left>
        <CraftignShardIcon />
      </template>

      <template v-if="isCrafting" #right>
        <UiSpinner size="5" />
      </template>
    </FancyButton>

    <FancyButton
      v-else
      :text="`Craft (${craftingCost})`"
      :disabled="isCrafting || isDecrafting || isUpgrading"
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
  align-items: start;
  gap: var(--size-3);
  justify-content: center;
  border-block-start: var(--border-size-1) solid var(--border-dimmed);
  display: flex;
  flex-direction: column;
  > button {
    width: 100%;
  }
}
</style>
