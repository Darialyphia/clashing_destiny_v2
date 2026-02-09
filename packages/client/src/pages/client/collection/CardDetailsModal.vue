<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import CardText from '@/card/components/CardText.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  api,
  CRAFTING_COST_PER_RARITY,
  DECRAFTING_REWARD_PER_RARITY,
  FOIL_CRAFTING_COST_MULTIPLIER,
  FOIL_DECRAFTING_REWARD_MULTIPLIER,
  type CardId
} from '@game/api';
import CraftignShardIcon from '@/player/components/CraftignShardIcon.vue';
import { useAuthedMutation } from '@/auth/composables/useAuth';
import UiSpinner from '@/ui/components/UiSpinner.vue';
import { useMe } from '@/auth/composables/useMe';
import { isFunction } from '@game/shared';

const { card } = defineProps<{
  card: {
    card: CardBlueprint;
    id: string;
    isFoil: boolean;
    copiesOwned: number;
  };
}>();

const isOpened = defineModel<boolean>('isOpened', { required: true });
const { data: me } = useMe();

const successMessage = ref<string | null>(null);
let successTimeout: ReturnType<typeof setTimeout> | null = null;

const showSuccess = (message: string) => {
  successMessage.value = message;
  if (successTimeout) clearTimeout(successTimeout);
  successTimeout = setTimeout(() => {
    successMessage.value = null;
  }, 1500);
};

const { mutate: craft, isLoading: isCrafting } = useAuthedMutation(
  api.cards.craft,
  {
    onSuccess: () => {
      showSuccess(
        `Craft succesful ${card.isFoil ? 'Foil ' : ''}${card.card.name}!`
      );
    }
  }
);

const { mutate: decraft, isLoading: isDecrafting } = useAuthedMutation(
  api.cards.decraft,
  {
    onSuccess: () => {
      showSuccess(`Disenchant succesful for ${decraftingReward.value} shards!`);
    }
  }
);

const craftingCost = computed(() => {
  return CRAFTING_COST_PER_RARITY[card.card.rarity];
});

const decraftingReward = computed(() => {
  const multiplier = card.isFoil ? FOIL_DECRAFTING_REWARD_MULTIPLIER : 1;
  return DECRAFTING_REWARD_PER_RARITY[card.card.rarity] * multiplier;
});

const description = computed(() => {
  return isFunction(card.card.description)
    ? card.card.description()
    : card.card.description;
});
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    :title="card.card.name"
    :description="description"
    :style="{ '--ui-modal-size': 'var(--size-lg)' }"
  >
    <article class="card-details">
      <aside class="card-preview">
        <Transition name="card" appear>
          <BlueprintCard
            :blueprint="card.card"
            show-stats
            :is-foil="card.isFoil"
          />
        </Transition>
      </aside>

      <section class="card-info surface">
        <header>
          <h2>{{ card.card.name }}</h2>
          <span
            class="rarity-badge"
            :style="{
              '--rarity-color': `var(--rarity-${card.card.rarity.toLowerCase()})`
            }"
          >
            {{ card.card.rarity }}
          </span>
          <p class="metadata">
            <span class="set-id">{{ card.card.setId }}</span>
            <span class="separator">•</span>
            <span class="copies-count">
              {{ card.copiesOwned }}
              {{ card.copiesOwned === 1 ? 'copy' : 'copies' }} owned
            </span>
          </p>
        </header>

        <section class="description">
          <h3>Description</h3>
          <CardText :text="description" />
        </section>

        <section v-if="card.card.abilities.length" class="abilities">
          <h3>Abilities</h3>
          <ul>
            <li v-for="(ability, index) in card.card.abilities" :key="index">
              <CardText :text="ability.description" />
            </li>
          </ul>
        </section>

        <Transition name="success-message">
          <aside v-if="successMessage" class="success-notification">
            {{ successMessage }}
          </aside>
        </Transition>

        <footer>
          <FancyButton
            :text="`Craft (${craftingCost})`"
            :disabled="isCrafting || isDecrafting"
            size="sm"
            @click="craft({ blueprintId: card.card.id, isFoil: false })"
          >
            <template #left>
              <CraftignShardIcon />
            </template>

            <template v-if="isCrafting" #right>
              <UiSpinner size="5" />
            </template>
          </FancyButton>

          <FancyButton
            :text="`Craft Foil (${craftingCost * FOIL_CRAFTING_COST_MULTIPLIER})`"
            :disabled="isCrafting || isDecrafting"
            size="sm"
            @click="craft({ blueprintId: card.card.id, isFoil: true })"
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
      </section>
    </article>
  </UiModal>
</template>

<style scoped lang="postcss">
.card-enter-active,
.card-leave-active {
  transition: rotate 1s var(--ease-spring-3);
}
.card-enter-from {
  rotate: 45deg;
}

.card-details {
  display: flex;
  gap: var(--size-5);
  min-height: var(--size-13);
}

.card-preview {
  --pixel-scale: 2.5;
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.card-info {
  --card-text-color: currentColor;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  min-width: 0;
}

.card-info > header {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  padding-block-end: var(--size-3);
  border-block-end: var(--border-size-1) solid var(--border-dimmed);
}

.card-info h2 {
  margin: 0;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  color: var(--text-1);
  line-height: var(--font-lineheight-2);
}

.rarity-badge {
  display: inline-block;
  padding: var(--size-1) var(--size-3);
  background: var(--rarity-color);
  color: var(--text-on-primary);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-3);
  border-radius: var(--radius-2);
  width: fit-content;
  box-shadow: var(--shadow-2);
}

.metadata {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  font-size: var(--font-size-1);
  color: var(--text-2);
}

.set-id {
  font-weight: var(--font-weight-6);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-1);
}

.separator {
  opacity: 0.5;
}

.copies-count {
  font-variant-numeric: tabular-nums;
}

.card-info section {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
}

.card-info h3 {
  margin: 0;
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  text-transform: uppercase;
  letter-spacing: var(--font-letterspacing-2);
}

.description {
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-3);
  border: var(--border-size-1) solid var(--border-subtle);
}

.abilities ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

.abilities li {
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  border-inline-start: var(--border-size-3) solid var(--primary);
  transition: background var(--ease-3) var(--speed-2);
}

.abilities li:hover {
  background: var(--surface-3);
}

.success-notification {
  padding: var(--size-3) var(--size-4);
  background: linear-gradient(135deg, var(--green-7), var(--green-10));
  color: var(--green-0);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  text-align: center;
  border-radius: var(--radius-3);
  border: var(--border-size-2) solid var(--green-7);
  box-shadow: var(--shadow-4);
  animation: pulse 0.5s ease-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-message-enter-active {
  transition:
    opacity var(--speed-3) var(--ease-3),
    transform var(--speed-3) var(--ease-spring-3);
}

.success-message-leave-active {
  transition:
    opacity var(--speed-2) var(--ease-2),
    transform var(--speed-2) var(--ease-2);
}

.success-message-enter-from {
  opacity: 0;
  transform: translateY(-1rem);
}

.success-message-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

footer {
  --pixel-scale: 1;
  margin-block-start: auto;
  padding-block-start: var(--size-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-3);
  justify-content: center;
  border-block-start: var(--border-size-1) solid var(--border-dimmed);
}

@media (max-width: 768px) {
  .card-details {
    flex-direction: column;
    gap: var(--size-4);
  }

  .card-preview {
    align-self: center;
  }
}
</style>
