import { useAuthedMutation } from '@/auth/composables/useAuth';
import { useToast } from '@/ui/composables/useToast';
import {
  api,
  CRAFTING_COST_PER_RARITY,
  DECRAFTING_REWARD_PER_RARITY,
  FOIL_CRAFTING_COST_MULTIPLIER,
  FOIL_DECRAFTING_REWARD_MULTIPLIER
} from '@game/api';
import {
  FOIL_UPGRADE_COST_PER_RARITY,
  MIN_COPIES_OWNED_TO_ALLOW_FOIL_UPGRADE
} from '@game/api/src/convex/card/card.constants';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';

export const useCrafting = (
  card: Ref<{
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  }>
) => {
  const { add: addToast } = useToast();

  const decraftingReward = computed(() => {
    const multiplier = card.value.isFoil
      ? FOIL_DECRAFTING_REWARD_MULTIPLIER
      : 1;
    return DECRAFTING_REWARD_PER_RARITY[card.value.card.rarity] * multiplier;
  });

  const craftingCost = computed(() => {
    const multiplier = card.value.isFoil ? FOIL_CRAFTING_COST_MULTIPLIER : 1;
    return CRAFTING_COST_PER_RARITY[card.value.card.rarity] * multiplier;
  });

  const upgradeCost = computed(() => {
    if (card.value.isFoil) return 0;
    return FOIL_UPGRADE_COST_PER_RARITY[card.value.card.rarity];
  });

  const { mutate: craft, isLoading: isCrafting } = useAuthedMutation(
    api.cards.craft,
    {
      onSuccess: () => {
        addToast({
          title: 'Card crafted',
          description: `${card.value.card.name} was added to your collection.`,
          variant: 'success'
        });
      },
      onError: error => {
        addToast({
          title: 'Error crafting card',
          description: error.message,
          variant: 'error'
        });
      }
    }
  );

  const { mutate: decraft, isLoading: isDecrafting } = useAuthedMutation(
    api.cards.decraft,
    {
      onSuccess: () => {
        addToast({
          title: 'Card disenchanted',
          description: `${card.value.card.name} was disenchanted for ${decraftingReward.value} shards.`,
          variant: 'success'
        });
      },
      onError: error => {
        addToast({
          title: 'Error disenchanting card',
          description: error.message,
          variant: 'error'
        });
      }
    }
  );

  const canUpgrade = computed(
    () =>
      !card.value.isFoil &&
      card.value.copiesOwned >= MIN_COPIES_OWNED_TO_ALLOW_FOIL_UPGRADE
  );
  const { mutate: upgrade, isLoading: isUpgrading } = useAuthedMutation(
    api.cards.upgradeCardToFoil,
    {
      onSuccess: () => {
        addToast({
          title: 'Card upgraded to foil',
          description: `${card.value.card.name} was upgraded to foil for ${upgradeCost.value} shards.`,
          variant: 'success'
        });
      },
      onError: error => {
        addToast({
          title: 'Error upgrading card to foil',
          description: error.message,
          variant: 'error'
        });
      }
    }
  );

  return {
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
  };
};
