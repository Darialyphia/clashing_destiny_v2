<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import { useGameClient, useGameUi } from '../composables/useGameClient';
import { useIsInAoe } from '../composables/useIsInAoe';
import { useCellTargeting } from '../composables/useCellTargeting';
import { useUnitActions } from '../composables/useUnitActions';
import { useUnitDragSelection } from '../composables/useUnitDragSelection';
import { useUnitArrowPath } from '../composables/useUnitArrowPath';
import { useUnitMoveFx } from '../composables/useUnitMoveFx';
import Unit from './Unit.vue';
import Arrow from './Arrow.vue';
import AbilityMenu from './AbilityMenu.vue';

const { cell } = defineProps<{
  cell: BoardCellViewModel;
}>();

const ui = useGameUi();
const { client, playerId } = useGameClient();
const isInAoe = useIsInAoe();

const { isTargetable, isTargeted } = useCellTargeting(cell);
const { canMoveTo, canAttack, canSelectUnit } = useUnitActions(cell);
const dragSelection = useUnitDragSelection(cell, canSelectUnit);
const { selectedUnitPath, pathColor } = useUnitArrowPath(cell);
const { isMovingUnit } = useUnitMoveFx(cell);

const isAbilityMenuOpened = ref(false);

const handleAbilities = () => {
  const availableAbilities = cell.unit!.abilities;
  if (availableAbilities.length === 1) {
    return availableAbilities[0].handler(cell.unit!.card);
  }
  if (availableAbilities.length > 1) {
    isAbilityMenuOpened.value = true;
  }
};

const handleMouseup = (e: MouseEvent) => {
  if (e.button !== 0) return;
  dragSelection.onMouseup();

  const shouldHandleAbilities =
    !ui.value.selectedUnit &&
    cell.unit &&
    cell.unit.getPlayer()?.id === playerId.value;

  if (shouldHandleAbilities) {
    handleAbilities();
  } else {
    ui.value.onBoardCellClick(cell);
  }
};
</script>

<template>
  <div
    :id="ui.DOMSelectors.cell(cell.position.x, cell.position.y).id"
    class="minion-cell"
    :class="{
      'is-in-aoe':
        isInAoe({ x: cell.position.x, y: cell.position.y }) &&
        !client.isPlayingFx,
      'is-targetable': isTargetable && !client.isPlayingFx,
      'is-targeted': isTargeted && !client.isPlayingFx,
      'can-move-to': canMoveTo && !client.isPlayingFx,
      'can-attack': canAttack && !client.isPlayingFx,
      'is-moving-unit': isMovingUnit
    }"
    @mouseenter="ui.hoverCell(cell)"
    @mouseleave="ui.unhoverCell()"
    @mouseup.stop="handleMouseup"
    @mousedown="dragSelection.onMousedown"
  >
    <AbilityMenu
      v-if="cell.unit"
      :card="cell.unit.card"
      v-model:isOpened="isAbilityMenuOpened"
      actions-side="top"
      use-portal
    >
      <Unit :unit="cell.unit" class="unit" />
    </AbilityMenu>

    <Teleport to="#arrows" defer>
      <Arrow
        v-if="selectedUnitPath"
        :path="selectedUnitPath"
        :color="pathColor"
      />
    </Teleport>
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
  position: relative;
  &.is-in-aoe,
  &.can-attack {
    background-image: url('@/assets/ui/board-small-card-slot-in-aoe.png');
    filter: drop-shadow(0 0 6px red);
    transition: filter 0.2s var(--ease-2);
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: red;
      opacity: 0.5;
      mix-blend-mode: multiply;
      transition: opacirt 0.2s var(--ease-2);
      z-index: 1;
      mask-image: url('@/assets/ui/board-small-card-slot.png');
      mask-size: cover;
    }
    &:hover {
      filter: drop-shadow(0 0 12px var(--red-5)) brightness(120%);
      &::after {
        opacity: 0.35;
      }
    }
  }

  &.is-targetable,
  &.can-move-to {
    background-image: url('@/assets/ui/board-small-card-slot-targetable.png');
    filter: drop-shadow(0 0 6px var(--blue-9));
    transition: filter 0.2s var(--ease-2);
    &:hover {
      filter: drop-shadow(0 0 12px var(--cyan-1)) brightness(250%);
    }
  }

  &.is-targeted {
    background-image: url('@/assets/ui/board-small-card-slot-selected.png');
    filter: drop-shadow(0 0 6px lime);
  }

  &.is-moving-unit {
    z-index: 1;
  }
}

:global(.minion-cell:has(.unit.is-being-dropped)) {
  z-index: 1;
}
</style>
