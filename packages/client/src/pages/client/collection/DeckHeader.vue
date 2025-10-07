<script setup lang="ts">
import UiTextInput from '@/ui/components/UiTextInput.vue';
import { useCollectionPage } from './useCollectionPage';

const { deckBuilder } = useCollectionPage();
</script>

<template>
  <div class="flex gap-2 items-center">
    <img class="edit-icon" src="/assets/ui/pen.png" />
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
