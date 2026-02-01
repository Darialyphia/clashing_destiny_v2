<script setup lang="ts">
import UiTextInput from '@/ui/components/UiTextInput.vue';
import { useCollectionPage } from './useCollectionPage';
import { Icon } from '@iconify/vue';
import UiModal from '@/ui/components/UiModal.vue';
import DeckPoster from '@/card/components/DeckPoster.vue';
import { assets } from '@/assets';

const { deckBuilder } = useCollectionPage();
const isPosterOpened = ref(false);
</script>

<template>
  <div class="flex gap-2 items-center">
    <button class="lt-lg:hidden" @click="isPosterOpened = true">
      <Icon icon="material-symbols:image-outline" class="w-7 h-7 c-primary" />
    </button>
    <UiModal
      v-model:is-opened="isPosterOpened"
      description="deck-poster"
      title="''"
      :style="{
        '--ui-modal-size': 'var(--size-xl)'
      }"
    >
      <DeckPoster
        :main-deck="deckBuilder.mainDeckCards"
        :destiny-deck="deckBuilder.destinyDeckCards"
        :name="deckBuilder.deck.name"
      />
    </UiModal>
    <img class="edit-icon" :src="assets['ui/pen'].path" />
    <UiTextInput
      v-model="deckBuilder.deck.name"
      class="flex-1"
      placeholder="Deck Name"
    />
  </div>
</template>

<style scoped lang="postcss">
.edit-icon {
  width: 24px;
  height: 24px;
}
</style>
