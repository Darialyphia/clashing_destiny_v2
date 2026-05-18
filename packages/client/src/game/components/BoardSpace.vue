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
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';
import { useCellHighlights } from '../composables/useCellHighlights';
import BoardCard from './BoardCard.vue';

const { cellId } = defineProps<{
  cellId: string;
}>();

const ui = useGameUi();
const { client } = useGameClient();

const cell = useEntity<BoardSpaceViewModel>(cellId);
const { isTargetable, isTargeted } = useCellTargeting(cell);
const { canMoveTo, canAttack, canSelectUnit, cannotSelectReason } =
  useCellHighlights(cell);
const dragSelection = useBoardCardDragSelection(cell, canSelectUnit);
const { path, pathColor } = useBoardSpaceArrowPath(cell);
const { isMovingUnit } = useCardMoveFx(cell);

const handleMouseup = (e: MouseEvent) => {
  if (e.button !== 0) return;
  dragSelection.onMouseup();

  ui.value.onBoardSpaceClick(cell.value);
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
        if (cell.occupant) {
          ui.hover(cell.occupant);
        }
      }
    "
    @mouseleave="ui.unhover()"
    @mouseup.stop="handleMouseup"
    @mousedown="dragSelection.onMousedown"
  >
    <BoardCard
      v-if="cell.occupant"
      :card="cell.occupant"
      :is-shaking="dragSelection.isShaking.value"
    />
    <Transition name="cannot-select-msg">
      <div
        v-if="dragSelection.isShowingMessage.value && cannotSelectReason"
        class="cannot-select-msg"
      >
        {{ cannotSelectReason }}
      </div>
    </Transition>

    <Teleport to="#arrows" defer>
      <Arrow v-if="path" :path="path" :color="pathColor" />
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

.cannot-select-msg {
  position: absolute;
  bottom: calc(100% + var(--size-3));
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  font-size: var(--size-3);
  font-weight: var(--font-weight-5);
  width: 100%;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  color: var(--red-5);
}

.cannot-select-msg-enter-active,
.cannot-select-msg-leave-active {
  transition:
    opacity 0.15s ease,
    translate 0.15s ease;
}

.cannot-select-msg-enter-from {
  opacity: 0;
  translate: 0 -6px;
}

.cannot-select-msg-leave-to {
  opacity: 0;
  translate: 0 -4px;
}
</style>
