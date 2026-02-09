<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useCollectionPage } from './useCollectionPage';
import { Icon } from '@iconify/vue';
import UiModal from '@/ui/components/UiModal.vue';
import UiButton from '@/ui/components/UiButton.vue';
import { useClipboard } from '@vueuse/core';
const { saveDeck, stopEditingDeck, deleteDeck, isDeleting, deckBuilder } =
  useCollectionPage();

const isDeleteModalOpened = ref(false);
const isExportModalOpened = ref(false);

const { copy, copied } = useClipboard({
  copiedDuring: 1500
});
</script>

<template>
  <footer>
    <div class="actions">
      <FancyButton text="Back" variant="error" @click="stopEditingDeck" />
      <FancyButton text="Save" variant="info" @click="saveDeck" />

      <UiButton
        class="aspect-square ml-auto"
        @click="isExportModalOpened = true"
      >
        <Icon icon="mdi:export" class="export-icon" />
      </UiButton>
      <UiButton class="aspect-square" @click="isDeleteModalOpened = true">
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

      <UiModal
        v-model:is-opened="isExportModalOpened"
        title="Export Deck Code"
        description=""
      >
        <div class="surface">
          <p class="text-center my-4 text-4">Deck Code</p>
          <pre
            class="bg-black/20 p-4 rounded text-center break-all select-all"
            >{{ deckBuilder.deckCode }}</pre
          >
          <footer class="flex justify-center mt-6 gap-6">
            <UiButton
              class="primary-button"
              @click="copy(deckBuilder.deckCode)"
            >
              Copy code
              <span v-if="copied">
                <Icon icon="mdi:check" />
              </span>
            </UiButton>
            <UiButton @click="isExportModalOpened = false">Close</UiButton>
          </footer>
        </div>
      </UiModal>
    </div>
  </footer>
</template>

<style scoped lang="postcss">
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

.export-icon {
  width: var(--size-6);
  color: var(--yellow-5);
  &:hover {
    color: var(--red-7);
  }
}

:has(.delete-icon, .export-icon) {
  padding: var(--size-0);
}

.actions {
  display: flex;
  gap: var(--size-2);
  margin-top: var(--size-3);
  align-items: center;
}

pre {
  white-space: pre-wrap;
}
</style>
