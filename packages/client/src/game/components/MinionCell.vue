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
import Arrow from './Arrow.vue';

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

const canSelectUnit = computed(() => {
  if (!cell.unit) return false;
  if (cell.unit.isExhausted) return false;
  if (!ui.value.isInteractivePlayer) return false;
  if (state.value.phase.state !== GAME_PHASES.MAIN) return false;
  if (state.value.interaction.state !== INTERACTION_STATES.IDLE) return false;
  return true;
});

const DRAG_THRESHOLD_PX = 30;

let startY = 0;
const onMousedown = (e: MouseEvent) => {
  if (!canSelectUnit.value) return;
  startY = e.clientY;

  document.body.addEventListener('mousemove', onMousemove);
};

const onMousemove = (e: MouseEvent) => {
  if (!cell.unit) return;
  const deltaY = startY - e.clientY;
  if (deltaY >= DRAG_THRESHOLD_PX && !ui.value.draggedCard) {
    ui.value.selectUnit(cell.unit);
    document.body.removeEventListener('mousemove', onMousemove);
  }
};

const selectedUnitPath = ref('');
const cellRef = useTemplateRef<HTMLElement>('cellRef');
const mousePos = ref({ x: 0, y: 0 });

const updateMousePos = (e: MouseEvent) => {
  mousePos.value = { x: e.clientX, y: e.clientY };
};

const computeParabolaPath = () => {
  if (!ui.value.selectedUnit) return '';
  if (!cellRef.value) return '';
  if (cell.unit?.id !== ui.value.selectedUnit.id) return '';

  const rect = cellRef.value.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height;
  const endX = mousePos.value.x;
  const endY = mousePos.value.y;

  // Control point for quadratic bezier - creates a parabola arc
  // Place it above the midpoint to create an upward arc
  const midX = (startX + endX) / 2;
  const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
  const arcHeight = Math.min(distance * 0.4, 150); // Arc height proportional to distance
  const controlY = Math.min(startY, endY) - arcHeight;

  return `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;
};

watch(
  [() => ui.value.selectedUnit, mousePos],
  () => {
    selectedUnitPath.value = computeParabolaPath();
  },
  { deep: true }
);

onMounted(() => {
  document.addEventListener('mousemove', updateMousePos);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', updateMousePos);
});
</script>

<template>
  <div
    ref="cellRef"
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
    @mouseup.stop="ui.onBoardCellClick(cell)"
    @mousedown="onMousedown"
  >
    <Unit v-if="cell.unit" :unit="cell.unit" />

    <Teleport to="#arrows" defer>
      <Arrow
        v-if="ui.selectedUnit && selectedUnitPath"
        :path="selectedUnitPath"
        color="red"
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

  &.is-in-aoe,
  &.can-attack {
    background-image: url('@/assets/ui/board-small-card-slot-in-aoe.png');
    filter: drop-shadow(0 0 10px red);
  }

  &.is-targetable,
  &.can-move-to {
    background-image: url('@/assets/ui/board-small-card-slot-targetable.png');
    filter: drop-shadow(0 0 10px var(--blue-9));
    transition: filter 0.2s var(--ease-2);
    &:hover {
      filter: drop-shadow(0 0 10px var(--cyan-1));
    }
  }

  &.is-targeted {
    background-image: url('@/assets/ui/board-small-card-slot-selected.png');
    filter: drop-shadow(0 0 10px lime);
  }
}
</style>
