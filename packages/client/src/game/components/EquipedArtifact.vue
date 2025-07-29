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

const { artifact } = defineProps<{
  artifact: CardViewModel;
}>();

const client = useGameClient();
const isActionsPopoverOpened = computed({
  get() {
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(artifact);
  },
  set(value) {
    console.log('toggle artifact actions popover', value);
    if (value) {
      client.value.ui.select(artifact);
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
      <InspectableCard :card-id="artifact.id" side="left" :side-offset="30">
        <div
          @click="client.ui.onCardClick(artifact)"
          class="artifact"
          :style="{
            '--bg': `url(${artifact.imagePath})`
          }"
        />
      </InspectableCard>
    </div>
    <PopoverPortal>
      <PopoverContent :side-offset="-50">
        <CardActions
          :card="artifact"
          v-model:is-opened="isActionsPopoverOpened"
        />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped lang="postcss">
.artifact {
  --pixel-scale: 1;
  aspect-ratio: var(--artifact-ratio);
  background-image: var(--bg);
  background-position: center;
  background-size: calc(96px * var(--pixel-scale))
    calc(96px * var(--pixel-scale));
  height: calc(var(--artifact-height) * var(--pixel-scale));
}
</style>
