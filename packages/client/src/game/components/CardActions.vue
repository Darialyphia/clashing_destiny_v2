<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import CardText from '@/card/components/CardText.vue';

const { card } = defineProps<{ card: CardViewModel }>();
const isOpened = defineModel<boolean>('isOpened', { required: true });
</script>

<template>
  <div class="actions-list">
    <button
      v-for="action in card.getActions()"
      :key="action.id"
      class="action"
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
</style>
