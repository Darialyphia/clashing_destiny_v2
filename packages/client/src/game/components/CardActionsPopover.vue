<script setup lang="ts">
import { useCard, useGameUi } from '../composables/useGameClient';
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent,
  type PopoverContentProps
} from 'reka-ui';
import CardActions from './CardActions.vue';

const {
  cardId,
  actionsOffset = -50,
  actionsSide,
  isInteractive = true,
  portalTarget = '#card-actions-portal'
} = defineProps<{
  cardId: string;
  actionsOffset?: number;
  actionsSide?: PopoverContentProps['side'];
  isInteractive?: boolean;
  portalTarget?: string;
}>();

const card = useCard(computed(() => cardId));
const ui = useGameUi();

const isActionsPopoverOpened = computed({
  get() {
    if (!isInteractive) return false;
    if (!ui.value.selectedCard) return false;
    return ui.value.selectedCard.equals(card.value);
  },
  set(value) {
    if (value) {
      ui.value.select(card.value);
    } else {
      ui.value.unselect();
    }
  }
});
</script>

<template>
  <PopoverRoot v-model:open="isActionsPopoverOpened" v-if="card">
    <PopoverAnchor>
      <slot />
    </PopoverAnchor>

    <PopoverPortal
      :to="portalTarget"
      :disabled="
        card.location === 'hand' ||
        card.location === 'discardPile' ||
        card.location === 'banishPile'
      "
    >
      <PopoverContent :side-offset="actionsOffset" :side="actionsSide">
        <CardActions :card="card" v-model:is-opened="isActionsPopoverOpened" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
