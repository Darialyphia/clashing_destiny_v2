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
      <InspectableCard :card-id="artifact.id" side="left" :side-offset="40">
        <div
          @click="client.ui.onCardClick(artifact)"
          class="artifact"
          :class="{ exhausted: artifact.isExhausted }"
          :style="{
            '--bg': `url(${artifact.imagePath})`
          }"
        >
          <div class="durability">{{ artifact.durability }}</div>
        </div>
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
  transform: translateZ(
    40px
  ); /* @FIXME this is needed otherwise we cannot click the artifact, wtf ? */
  position: relative;
  &.exhausted {
    filter: brightness(75%);
  }
}

.durability {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 20px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 10px;
  background: url(/assets/ui/durability.png) no-repeat right center;
  background-size: 20px 20px;
  text-align: right;
  font-weight: var(--font-weight-5);
}
</style>
