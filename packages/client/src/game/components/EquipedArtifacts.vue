<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useBoardSide,
  useEntities,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import GameCard from './GameCard.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const boardSide = useBoardSide(computed(() => player.id));
const artifacts = useEntities<CardViewModel>(
  computed(() => boardSide.value.heroZone.artifacts)
);

const ui = useGameUi();

const myPlayer = useMyPlayer();
</script>

<template>
  <div
    class="equiped-artifacts"
    :class="{ 'ui-hidden': !ui.displayedElements.artifacts }"
    :style="{ '--total': artifacts.length }"
  >
    <div
      class="equiped-artifact"
      v-for="(artifact, i) in artifacts"
      :key="artifact.id"
      :style="{ '--z': artifacts.length - i }"
    >
      <InspectableCard
        :card-id="artifact.id"
        :side="player.equals(myPlayer) ? 'right' : 'left'"
      >
        <GameCard :card-id="artifact.id" variant="small" show-stats />
      </InspectableCard>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.equiped-artifacts {
  display: flex;
  flex-direction: column;
}

.equiped-artifact {
  z-index: var(--z);
  &:hover {
    z-index: calc(var(--total) + 1);
  }
  &:not(:first-child) {
    margin-top: calc(var(--card-small-height) * -0.65);
  }
}
</style>
