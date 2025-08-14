<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import CardText from '@/card/components/CardText.vue';
import { useGameClient } from '../composables/useGameClient';

const { card } = defineProps<{ card: CardViewModel }>();
const isOpened = defineModel<boolean>('isOpened', { required: true });
watchEffect(() => {
  if (!isOpened.value) return;
  if (card.actions.length === 0) {
    setTimeout(() => {
      isOpened.value = false;
    }, 2000);
  }
});

const client = useGameClient();
</script>

<template>
  <div class="actions-list">
    <p v-if="!card.actions.length">No actions available</p>
    <button
      v-for="action in card.actions"
      :key="action.id"
      class="action"
      :id="client.ui.DOMSelectors.cardAction(card.id, action.id).id"
      @click="
        () => {
          action.handler(card);
          isOpened = false;
        }
      "
    >
      <CardText :text="action.getLabel(card)" />
    </button>
  </div>
</template>

<style scoped lang="postcss">
.actions-list {
  display: flex;
  flex-direction: column;
}
.action {
  background: black;
  padding: 0.5rem;
  min-width: 10rem;
  text-align: left;
  &:hover {
    background: var(--gray-10);
  }
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: solid 2px hsl(var(--cyan-4-hsl));
  }
}

p {
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
  text-shadow:
    0 0 2px black,
    0 0 1px black;
}
</style>
