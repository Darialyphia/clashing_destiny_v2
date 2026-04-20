<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import CardText from '@/card/components/CardText.vue';

const isOpened = defineModel<boolean>('isOpened', { required: true });
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent,
  type PopoverContentProps
} from 'reka-ui';

const { card, usePortal, portalTarget } = defineProps<{
  card: CardViewModel;
  usePortal?: boolean;
  actionsOffset?: number;
  portalTarget?: string;
  actionsSide?: PopoverContentProps['side'];
  actionsAlign?: PopoverContentProps['align'];
}>();

const abilities = computed(() => {
  if (!card) return [];
  return card.abilityActions;
});
</script>

<template>
  <PopoverRoot v-model:open="isOpened">
    <PopoverAnchor>
      <slot />
    </PopoverAnchor>

    <PopoverPortal
      :to="portalTarget"
      :disabled="
        !usePortal ||
        card.location === CARD_LOCATIONS.HAND ||
        card.location === CARD_LOCATIONS.DISCARD_PILE
      "
    >
      <PopoverContent
        :side-offset="actionsOffset"
        :side="actionsSide"
        :align="actionsAlign"
      >
        <div class="abilities-list">
          <button
            v-for="(ability, index) in abilities"
            :key="`${ability.id}-${index}`"
            class="ability"
            :disabled="!ability.predicate()"
            @click="
              () => {
                ability.handler(card);
                isOpened = false;
              }
            "
          >
            <CardText :text="ability.getLabel()" />
          </button>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped lang="postcss">
.abilities-list {
  display: flex;
  flex-direction: column;
  &:not(:has(> p)) {
    border: solid 2px var(--primary);
  }
}
.ability {
  --card-text-color: #d1c6c2;
  background: var(--gray-9);
  padding: 0.5rem;
  min-width: 10rem;
  text-align: left;
  &:hover:not(:disabled) {
    background: var(--gray-10);
  }
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: solid 2px hsl(var(--cyan-4-hsl));
  }
  &:disabled {
    filter: brightness(50%);
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
