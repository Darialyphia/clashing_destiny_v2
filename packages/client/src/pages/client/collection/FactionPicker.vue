<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FactionIcon from '@/card/components/FactionIcon.vue';
import {
  DECK_FACTION_IDS,
  FACTIONS,
  type DeckFactionId
} from '@game/engine/src/card/factions/factions';

const isOpened = defineModel<boolean>('isOpened', { required: true });
const emit = defineEmits<{ select: [factionId: DeckFactionId] }>();

const select = (factionId: DeckFactionId) => {
  isOpened.value = false;
  emit('select', factionId);
};
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Choose a faction"
    description="Choose the faction of your new deck"
    :style="{ '--ui-modal-size': 'var(--size-md)' }"
  >
    <div class="surface text-center">
      <h3 class="text-5 my-4 dual-text" data-text="Choose a faction">
        Choose a faction
      </h3>
      <ul class="factions">
        <li v-for="factionId in DECK_FACTION_IDS" :key="factionId">
          <button class="faction" @click="select(factionId)">
            <FactionIcon :faction-id="factionId" :size="5" />
            <span>{{ FACTIONS[factionId].name }}</span>
          </button>
        </li>
      </ul>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
p {
  text-wrap: balance;
}

.factions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--size-3);
  margin-block: var(--size-5);
}

h3 {
  font-family: 'Cinzel Decorative';
}

.faction {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-3);
  border: solid 1px hsl(var(--color-primary-hsl) / 0.35);
  border-radius: var(--radius-2);
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  transition:
    filter 0.2s,
    border-color 0.2s;
  &:hover,
  &:focus-visible {
    border-color: var(--primary);
    filter: brightness(1.25)
      drop-shadow(0 0 0.5rem hsl(var(--color-primary-hsl) / 0.6));
  }
}
</style>
