<script setup lang="ts">
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { useGameClient } from '../composables/useGameClient';
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent
} from 'reka-ui';
import CardActions from './CardActions.vue';

const { destiny } = defineProps<{
  destiny: CardViewModel;
}>();

const client = useGameClient();
const isActionsPopoverOpened = computed({
  get() {
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(destiny);
  },
  set(value) {
    if (value) {
      client.value.ui.select(destiny);
    } else {
      client.value.ui.unselect();
    }
  }
});
</script>

<template>
  <PopoverRoot v-model:open="isActionsPopoverOpened">
    <div>
      <PopoverAnchor />
      <InspectableCard :card-id="destiny.id" side="bottom" :side-offset="30">
        <div
          @click="client.ui.onCardClick(destiny)"
          class="destiny"
          :class="{ exhausted: destiny.isExhausted }"
          :style="{
            '--bg': `url(${destiny.imagePath})`
          }"
        ></div>
      </InspectableCard>
    </div>
    <PopoverPortal>
      <PopoverContent side="bottom" :side-offset="60">
        <CardActions
          :card="destiny"
          v-model:is-opened="isActionsPopoverOpened"
        />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped lang="postcss">
.destiny {
  background: var(--bg);
  background-position: center;
  width: 48px;
  background-size: 96px;
  aspect-ratio: 1;

  &.exhausted {
    filter: grayscale(1) brightness(0.75);
  }
}
</style>
