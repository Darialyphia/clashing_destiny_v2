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
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
const {
  cardId,
  actionsOffset = -50,
  actionsSide,
  actionsAlign,
  showActionEmptyState = true,
  isInteractive = true,
  usePortal = true,
  portalTarget = '#card-actions-portal'
} = defineProps<{
  cardId: string;
  actionsOffset?: number;
  actionsSide?: PopoverContentProps['side'];
  actionsAlign?: PopoverContentProps['align'];
  showActionEmptyState?: boolean;
  isInteractive?: boolean;
  usePortal?: boolean;
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
        !usePortal ||
        card.location === CARD_LOCATIONS.HAND ||
        card.location === CARD_LOCATIONS.DISCARD_PILE ||
        card.location === CARD_LOCATIONS.BANISH_PILE
      "
    >
      <PopoverContent
        :side-offset="actionsOffset"
        :side="actionsSide"
        :align="actionsAlign"
      >
        <CardActions
          :card="card"
          v-model:is-opened="isActionsPopoverOpened"
          :show-empty-state="showActionEmptyState"
        />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
