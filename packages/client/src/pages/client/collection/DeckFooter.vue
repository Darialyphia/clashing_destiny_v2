<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useCollectionPage } from './useCollectionPage';
import { Icon } from '@iconify/vue';
import UiModal from '@/ui/components/UiModal.vue';
import UiButton from '@/ui/components/UiButton.vue';

const { deckBuilder, saveDeck, stopEditingDeck, deleteDeck, isDeleting } =
  useCollectionPage();

const isDeleteModalOpened = ref(false);
</script>

<template>
  <footer>
    <div class="deck-count">
      <div>
        Main deck ({{ deckBuilder.mainDeckSize }} /
        {{ deckBuilder.validator.mainDeckSize }})
      </div>
      <div>
        Destiny Deck ({{ deckBuilder.destinyDeckSize }} /
        {{ deckBuilder.validator.destinyDeckSize }})
      </div>
    </div>
    <div class="actions">
      <FancyButton text="Back" variant="error" @click="stopEditingDeck" />
      <FancyButton text="Save" variant="info" @click="saveDeck" />

      <UiButton
        class="aspect-square ml-auto"
        @click="isDeleteModalOpened = true"
      >
        <Icon
          icon="material-symbols:delete-outline-sharp"
          class="delete-icon"
        />
      </UiButton>
      <UiModal
        v-model:is-opened="isDeleteModalOpened"
        title="Delete this deck ?"
        description="Are you sure you want to delete this deck ? This action cannot be undone."
      >
        <div class="surface py-8">
          <p class="text-center mb-5 text-4">
            Are you sure you want to delete this deck ?
          </p>
          <footer class="flex justify-center gap-6">
            <FancyButton text="Cancel" @click="isDeleteModalOpened = false" />
            <FancyButton
              text="Delete"
              variant="error"
              :disabled="isDeleting"
              @click="deleteDeck"
            />
          </footer>
        </div>
      </UiModal>
    </div>
  </footer>
</template>

<style scoped lang="postcss">
.deck-count {
  margin-top: auto;
  font-size: var(--font-size-1);
  line-height: 1;
  font-weight: 500;
  text-align: right;
  padding: var(--size-3) var(--size-3) 0;
  box-shadow: 0 -10px 1rem hsl(var(--gray-12-hsl) / 0.5);
}

footer {
  position: sticky;
  bottom: 0;
  background-color: #10181e;
}

.delete-icon {
  width: var(--size-6);
  color: var(--red-7);
  &:hover {
    color: var(--red-9);
  }
}

.actions {
  display: flex;
  gap: var(--size-2);
  margin-top: var(--size-3);
  align-items: center;
}
</style>
