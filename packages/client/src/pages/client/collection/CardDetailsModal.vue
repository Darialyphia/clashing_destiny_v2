<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import CardText from '@/card/components/CardText.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  CRAFTING_COST_PER_RARITY,
  DECRAFTING_REWARD_PER_RARITY
} from '@game/api';
import CraftignShardIcon from '@/player/components/CraftignShardIcon.vue';

const { card } = defineProps<{
  card: {
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  };
}>();

const isOpened = defineModel<boolean>('isOpened', { required: true });
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    :title="card.card.name"
    :description="card.card.description"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
  >
    <div class="card-details-modal">
      <BlueprintCard :blueprint="card.card" show-stats :is-foil="card.isFoil" />
      <div class="surface details">
        <h2>{{ card.card.name }}</h2>
        <div
          class="rarity"
          :style="{
            '--color': `var(--rarity-${card.card.rarity.toLowerCase()})`
          }"
        >
          {{ card.card.rarity }}
        </div>
        <div>{{ card.card.setId }} — {{ card.copiesOwned }} copies owned</div>
        <h3>Description</h3>
        <div>
          <CardText :text="card.card.description" />
        </div>

        <template v-if="card.card.abilities.length">
          <h3>Abilities</h3>

          <div v-for="(ability, index) in card.card.abilities" :key="index">
            <CardText :text="ability.description" />
          </div>
        </template>
        <h3>Abilities</h3>

        <footer>
          <FancyButton
            :text="`Craft (${CRAFTING_COST_PER_RARITY[card.card.rarity]})`"
          >
            <template #left>
              <CraftignShardIcon />
            </template>
          </FancyButton>
          <FancyButton
            :disabled="card.copiesOwned > 0"
            :text="`Disenchant (${DECRAFTING_REWARD_PER_RARITY[card.card.rarity]})`"
          >
            <template #left>
              <CraftignShardIcon />
            </template>
          </FancyButton>
        </footer>
      </div>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.card-details-modal {
  display: flex;
  gap: var(--size-1);
}

.rarity {
  color: var(--color);
  text-transform: capitalize;
}

.details {
  --card-text-color: currentColor;
  flex: 1;
  display: flex;
  flex-direction: column;
}

footer {
  --pixel-scale: 1;
  margin-top: auto;
  display: flex;
  gap: var(--size-2);
}
</style>
