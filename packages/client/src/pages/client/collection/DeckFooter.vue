<script setup lang="ts">
import FancyButton from '@/ui/components/FancyButton.vue';
import { useCollectionPage } from './useCollectionPage';
import { Icon } from '@iconify/vue';
import UiModal from '@/ui/components/UiModal.vue';
import UiButton from '@/ui/components/UiButton.vue';
import { useClipboard } from '@vueuse/core';
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent
} from 'reka-ui';
import UiIconButton from '@/ui/components/UiIconButton.vue';
import UiSwitch from '@/ui/components/UiSwitch.vue';
import { useResponsive } from '@/shared/composables/useResponsive';

const {
  saveDeck,
  stopEditingDeck,
  deleteDeck,
  isDeleting,
  deckBuilder,
  deckEditorOptions
} = useCollectionPage();

const isDeleteModalOpened = ref(false);
const isExportModalOpened = ref(false);

const { copy, copied } = useClipboard({
  copiedDuring: 1500
});

const isMenuOpened = ref(false);

const { isSmallViewport } = useResponsive();
</script>

<template>
  <footer>
    <div class="actions">
      <FancyButton
        :size="isSmallViewport ? 'sm' : 'md'"
        text="Back"
        variant="error"
        @click="stopEditingDeck"
      />
      <FancyButton
        :size="isSmallViewport ? 'sm' : 'md'"
        text="Save"
        variant="info"
        @click="saveDeck"
      />

      <UiIconButton
        v-if="!isSmallViewport"
        class="delete-icon"
        icon="material-symbols:delete-outline-sharp"
        @click="isDeleteModalOpened = true"
      />
      <PopoverRoot v-model:open="isMenuOpened">
        <PopoverTrigger as-child>
          <UiIconButton class="export-icon" icon="solar:menu-dots-bold" />
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent as-child side="top" align="center" :side-offset="10">
            <div class="options-popover surface">
              <button
                v-if="isSmallViewport"
                @click="
                  () => {
                    isDeleteModalOpened = true;
                    isMenuOpened = false;
                  }
                "
              >
                Delete deck
              </button>
              <button @click="isExportModalOpened = true">Export Deck</button>
              <label class="block">
                <span>Collapse foils</span>
                <UiSwitch v-model="deckEditorOptions.collapseFoil" />
              </label>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>

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
            class="bg-black/20 p-4 rounded text-center break-all select-all mx-auto"
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
}

.delete-icon {
  --ui-icon-button-size: var(--font-size-4);
  color: var(--red-7);
  margin-left: auto;
  &:hover {
    color: var(--red-9);
  }
}

.export-icon {
  --ui-icon-button-size: var(--font-size-4);
  color: var(--yellow-5);
  &:hover {
    color: var(--yellow-9);
  }
}

.actions {
  display: flex;
  gap: var(--size-2);
  margin-top: var(--size-3);
  align-items: center;

  @screen lt-lg {
    justify-content: end;
  }
}

pre {
  white-space: pre-wrap;
}

.options-popover {
  display: flex;
  gap: var(--size-3);
  flex-direction: column;
  min-width: 280px;
  > button {
    padding: 0;
    text-align: left;
    &:hover {
      color: var(--yellow-4);
    }
  }
  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--size-4);
  }
}
</style>
