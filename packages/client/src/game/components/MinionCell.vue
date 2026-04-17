<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../composables/useGameClient';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { Vec2 } from '@game/shared';
import { useIsInAoe } from '../composables/useIsInAoe';
import Unit from './Unit.vue';

const { cell } = defineProps<{
  cell: BoardCellViewModel;
}>();

const state = useGameState();
const ui = useGameUi();
const { client } = useGameClient();

const isTargetable = computed(() => {
  const interaction = state.value.interaction;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  return (
    !isTargeted.value &&
    interaction.ctx.elligibleSpaces.some(
      spaceId =>
        spaceId === pointToCellId({ x: cell.position.x, y: cell.position.y })
    )
  );
});

const isTargeted = computed(() => {
  const { interaction, phase } = state.value;
  if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
    return false;
  }

  if (
    interaction.ctx.selectedSpaces.some(
      space =>
        pointToCellId(space) ===
        pointToCellId({ x: cell.position.x, y: cell.position.y })
    )
  ) {
    return true;
  }

  if (phase.state === GAME_PHASES.PLAYING_CARD) {
    const card = state.value.entities[phase.ctx.card] as CardViewModel;
    if (!card) return false;
    return card.spacesToHighlight.some(point =>
      Vec2.fromPoint(point).equals({ x: cell.position.x, y: cell.position.y })
    );
  }

  return false;
});

const canMoveTo = computed(() => {
  if (!ui.value.selectedUnit) return false;
  return ui.value.selectedUnit.canMoveTo(cell);
});

const canAttack = computed(() => {
  if (!ui.value.selectedUnit) return false;
  return ui.value.selectedUnit.canAttackAt(cell);
});
const isInAoe = useIsInAoe();
</script>

<template>
  <div
    class="minion-cell"
    :class="{
      'is-in-aoe':
        isInAoe({ x: cell.position.x, y: cell.position.y }) &&
        !client.isPlayingFx,
      'is-targetable': isTargetable && !client.isPlayingFx,
      'is-targeted': isTargeted && !client.isPlayingFx,
      'can-move-to': canMoveTo && !client.isPlayingFx,
      'can-attack': canAttack && !client.isPlayingFx
    }"
    @mouseenter="ui.hoverCell(cell)"
    @mouseleave="ui.unhoverCell()"
    @mouseup="ui.onBoardCellClick(cell)"
  >
    <Unit v-if="cell.unit" :unit="cell.unit" />
  </div>
</template>

<style scoped lang="postcss">
.minion-cell {
  width: 148px;
  height: 130px;
  background: url('@/assets/ui/board-small-card-slot.png') no-repeat center
    center;
  transition: background-image 0.25s;
  display: grid;
  place-content: center;

  &.is-in-aoe,
  &.can-attack {
    background-image: url('@/assets/ui/board-small-card-slot-in-aoe.png');
  }

  &.is-targetable,
  &.can-move-to {
    background-image: url('@/assets/ui/board-small-card-slot-targetable.png');
  }

  &.is-targeted {
    background-image: url('@/assets/ui/board-small-card-slot-selected.png');
  }
}
</style>
