<script setup lang="ts">
import { useBoardSide, useGameClient } from '../composables/useGameClient';
import MinionSlot from './MinionSlot.vue';

const { playerId } = defineProps<{ playerId: string }>();

const boardSide = useBoardSide(computed(() => playerId));
const client = useGameClient();
const isFlipped = computed(() => client.value.playerId !== playerId);
</script>

<template>
  <div class="minion-zone">
    <div
      class="minion-row"
      :class="{
        'ui-hidden': isFlipped
          ? !client.ui.displayedElements.defenseZone
          : !client.ui.displayedElements.attackZone
      }"
      :id="
        isFlipped
          ? client.ui.DOMSelectors.backRow(playerId).id
          : client.ui.DOMSelectors.frontRow(playerId).id
      "
      :style="{
        '--cols': isFlipped
          ? boardSide.backRow.slots.length
          : boardSide.frontRow.slots.length
      }"
    >
      <MinionSlot
        v-for="slot in isFlipped
          ? boardSide.backRow.slots
          : boardSide.frontRow.slots"
        :key="slot.position"
        :minion-slot="slot"
      />
    </div>
    <div
      class="minion-row"
      :class="{
        'ui-hidden': isFlipped
          ? !client.ui.displayedElements.attackZone
          : !client.ui.displayedElements.defenseZone
      }"
      :id="
        isFlipped
          ? client.ui.DOMSelectors.frontRow(playerId).id
          : client.ui.DOMSelectors.backRow(playerId).id
      "
      :style="{
        '--cols': isFlipped
          ? boardSide.frontRow.slots.length
          : boardSide.backRow.slots.length
      }"
    >
      <MinionSlot
        v-for="slot in isFlipped
          ? boardSide.frontRow.slots
          : boardSide.backRow.slots"
        :key="slot.position"
        :minion-slot="slot"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.minion-zone {
  display: grid;
  justify-self: center;
  gap: var(--size-4);
  transform-style: preserve-3d;

  .minion-row {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    gap: var(--size-4);
    justify-items: center;
    align-items: center;
    transform-style: preserve-3d;
  }
}
</style>
