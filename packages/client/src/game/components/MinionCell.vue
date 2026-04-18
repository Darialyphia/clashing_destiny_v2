<script setup lang="ts">
import type { BoardCellViewModel } from '@game/engine/src/client/view-models/board-cell.model';
import {
  useFxEvent,
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
import { Vec2, waitFor } from '@game/shared';
import { useIsInAoe } from '../composables/useIsInAoe';
import Unit from './Unit.vue';
import Arrow from './Arrow.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { Flip } from 'gsap/Flip';

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

let startX = 0;
let startY = 0;
const onMousedown = (e: MouseEvent) => {
  if (!canSelectUnit.value) return;
  startX = e.clientX;
  startY = e.clientY;

  document.body.addEventListener('mousemove', onMousemove);
};

const onMousemove = (e: MouseEvent) => {
  if (!cell.unit) return;
  const deltaY = Math.abs(startY - e.clientY);
  const deltaX = Math.abs(startX - e.clientX);
  if (deltaY >= DRAG_THRESHOLD_PX || deltaX >= DRAG_THRESHOLD_PX) {
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

useFxEvent(FX_EVENTS.UNIT_AFTER_MOVE, async event => {
  if (event.unit === cell.unit?.id) {
    const state = Flip.getState(
      ui.value.DOMSelectors.unit(event.unit).element!
    );
    cell.update({
      unit: undefined
    });
    await nextTick();
    await Flip.from(state, {
      targets: [ui.value.DOMSelectors.unit(event.unit).element!],
      duration: 0.5,
      absolute: true,
      ease: Power1.easeInOut
    });
  }
  if (event.position.x === cell.x && event.position.y === cell.y) {
    console.log('adding unit to cell', cell.x, cell.y);
    cell.update({
      unit: event.unit
    });
  }
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
    filter: drop-shadow(0 0 6px red);
    transition: filter 0.2s var(--ease-2);
    &:hover {
      filter: drop-shadow(0 0 12px var(--red-5)) brightness(120%);
    }
  }

  &.is-targetable,
  &.can-move-to {
    background-image: url('@/assets/ui/board-small-card-slot-targetable.png');
    filter: drop-shadow(0 0 6px var(--blue-9));
    transition: filter 0.2s var(--ease-2);
    &:hover {
      filter: drop-shadow(0 0 12px var(--cyan-1)) brightness(120%);
    }
  }

  &.is-targeted {
    background-image: url('@/assets/ui/board-small-card-slot-selected.png');
    filter: drop-shadow(0 0 6px lime);
  }
}
</style>
