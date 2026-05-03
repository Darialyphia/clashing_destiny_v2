<script setup lang="ts">
import {
  useEntity,
  useGameClient,
  useGameUi
} from '../composables/useGameClient';
import { useCellTargeting } from '../composables/useCellTargeting';
import { useBoardCardDragSelection } from '../composables/useBoardCardDragSelection';
import { useBoardSpaceArrowPath } from '../composables/useBoardSpaceArrowPath';
import { useCardMoveFx } from '../composables/useCardMoveFx';
import Arrow from './Arrow.vue';
import AbilityMenu from './AbilityMenu.vue';
import { isDefined } from '@game/shared';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';
import { useCellHighlights } from '../composables/useCellHighlights';
import BoardCard from './BoardCard.vue';

const { cellId } = defineProps<{
  cellId: string;
}>();

const ui = useGameUi();
const { client, playerId } = useGameClient();

const cell = useEntity<BoardSpaceViewModel>(cellId);
const { isTargetable, isTargeted } = useCellTargeting(cell);
const { canMoveTo, canAttack, canSelectUnit } = useCellHighlights(cell);
const dragSelection = useBoardCardDragSelection(cell, canSelectUnit);
const { selectedUnitPath, pathColor } = useBoardSpaceArrowPath(cell);
const { isMovingUnit } = useCardMoveFx(cell);

const isAbilityMenuOpened = ref(false);

const handleAbilities = () => {
  if (!cell.value.card) return;
  const availableAbilities = cell.value.card.abilityActions ?? [];
  if (availableAbilities.length === 1) {
    return availableAbilities[0].handler(cell.value.card);
  }
  if (availableAbilities.length > 1) {
    isAbilityMenuOpened.value = true;
  }
};

const handleMouseup = (e: MouseEvent) => {
  if (e.button !== 0) return;
  dragSelection.onMouseup();

  const shouldHandleAbilities =
    !ui.value.selectedCard &&
    isDefined(cell.value.card) &&
    cell.value.card.player.id === playerId.value;

  if (shouldHandleAbilities) {
    handleAbilities();
  } else {
    ui.value.onBoardSpaceClick(cell.value);
  }
};
</script>

<template>
  <div
    :id="ui.DOMSelectors.boardSpace(cell).id"
    class="minion-cell"
    :class="{
      'is-targetable': isTargetable && !client.isPlayingFx,
      'is-targeted': isTargeted && !client.isPlayingFx,
      'can-move-to': canMoveTo && !client.isPlayingFx,
      'can-attack': canAttack && !client.isPlayingFx,
      'is-moving-unit': isMovingUnit
    }"
    @mouseenter="
      () => {
        if (cell.card) {
          ui.hover(cell.card);
        }
      }
    "
    @mouseleave="ui.unhover()"
    @mouseup.stop="handleMouseup"
    @mousedown="dragSelection.onMousedown"
  >
    <AbilityMenu
      v-if="cell.card"
      :card="cell.card"
      v-model:isOpened="isAbilityMenuOpened"
      actions-side="top"
      use-portal
    >
      <BoardCard v-if="cell.card" :card="cell.card" />
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
