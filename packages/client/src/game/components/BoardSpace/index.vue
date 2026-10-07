<script setup lang="ts">
import {
  useEntity,
  useGameClient,
  useGameUi
} from '../../composables/useGameClient';
import { useCellTargeting } from '../../composables/useCellTargeting';
import { useBoardCardDragSelection } from './useBoardSpaceDragSelection';
import { useBoardSpaceArrowPath } from './useBoardSpaceArrowPath';
import { useCardMoveFx } from '../../composables/useCardMoveFx';
import Arrow from '../Arrow.vue';
import type { BoardSpaceViewModel } from '@game/engine/src/client/view-models/board-space.model';
import { useCellHighlights } from '../../composables/useCellHighlights';
import BoardCard from '../BoardCard/index.vue';
import { useFloating, autoUpdate } from '@floating-ui/vue';

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

const handleMouseup = async (e: MouseEvent) => {
  if (e.button !== 0) return;
  dragSelection.onMouseup();

  const actionTaken = ui.value.onBoardSpaceClick(cell.value);
  if (actionTaken) e.stopPropagation();
};

const rootEl = useTemplateRef('root');
const errorMessageEl = useTemplateRef('errorMessage');

const { floatingStyles } = useFloating(rootEl, errorMessageEl, {
  placement: 'top',
  strategy: 'absolute',
  whileElementsMounted: autoUpdate
});
</script>

<template>
  <div
    :id="ui.DOMSelectors.boardSpace(cell.id).id"
    class="board-cell"
    :class="{
      'is-targetable': isTargetable && !client.isPlayingFx,
      'is-targeted': isTargeted && !client.isPlayingFx,
      'can-move-to': canMoveTo && !client.isPlayingFx,
      'can-attack': canAttack && !client.isPlayingFx,
      'is-moving-unit': isMovingUnit
    }"
    ref="root"
    @mouseup="handleMouseup"
    @mousedown="dragSelection.onMousedown"
  >
    <BoardCard
      v-if="cell.card"
      :card="cell.card"
      :is-shaking="dragSelection.isShaking.value"
    />
    <Teleport to="body">
      <Transition name="cannot-select-msg">
        <div
          ref="errorMessage"
          v-if="dragSelection.isShowingMessage.value && cannotSelectReason"
          :style="floatingStyles"
          class="cannot-select-msg"
        >
          {{ cannotSelectReason }}
        </div>
      </Transition>
    </Teleport>

    <Teleport to="#arrows" defer>
      <Arrow v-if="path" :path="path" :color="pathColor" />
    </Teleport>
  </div>
</template>

<style scoped lang="postcss">
.board-cell {
  width: var(--card-small-v3-width);
  height: var(--card-small-v3-height);
  background: url('@/assets/ui/board-small-card-slot.png') no-repeat center
    center;
  transition:
    background-image 0.25s,
    filter 0.2s var(--ease-2),
    translate 0.2s var(--ease-2);
  display: grid;
  place-content: center;
  position: relative;
  &.is-in-aoe,
  &.can-attack {
    background-image: url('@/assets/ui/board-small-card-slot-in-aoe.png');
    filter: drop-shadow(0 0 6px red);
    translate: 0 -8px;

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
  z-index: 99;
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
