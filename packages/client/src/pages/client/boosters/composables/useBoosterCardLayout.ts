import {
  computed,
  onUnmounted,
  ref,
  watch,
  type ComputedRef,
  type Ref
} from 'vue';
import type { BoosterPackCardEntry, DealingStatus } from './useBoosterPack';

const CARD_FAN_RADIUS = 800;
const CARD_FAN_START_ANGLE = -90;
const CARD_FAN_ANGLE_STEP = 12;
const FINAL_LAYOUT_DELAY_MS = 1000;
const FINAL_LAYOUT_TRANSITION_MS = 800;
const FINAL_LAYOUT_COLUMNS = 4;
const FINAL_LAYOUT_COLUMN_SPACING = 320;
const FINAL_LAYOUT_ROW_SPACING = 440;
const FINAL_LAYOUT_OFFSET_Y = 0;

export function useBoosterCardLayout(
  cards: ComputedRef<BoosterPackCardEntry[]>,
  dealingStatus: Ref<DealingStatus>,
  flippedCards: Ref<Set<number>>
) {
  const allRevealed = computed(
    () =>
      cards.value.length > 0 && flippedCards.value.size === cards.value.length
  );
  const isFinalLayout = ref(false);
  let finalLayoutTimeout: ReturnType<typeof setTimeout> | undefined;

  const clearFinalLayoutTimeout = () => {
    if (finalLayoutTimeout) {
      clearTimeout(finalLayoutTimeout);
      finalLayoutTimeout = undefined;
    }
  };

  watch(
    [allRevealed, cards],
    ([revealed]) => {
      clearFinalLayoutTimeout();
      isFinalLayout.value = false;

      if (revealed) {
        finalLayoutTimeout = setTimeout(() => {
          isFinalLayout.value = true;
        }, FINAL_LAYOUT_DELAY_MS);
      }
    },
    { immediate: true }
  );

  onUnmounted(clearFinalLayoutTimeout);

  const cardStyles = computed(() => {
    const count = cards.value.length;

    const totalArc = (count - 1) * CARD_FAN_ANGLE_STEP;
    const startAngle = CARD_FAN_START_ANGLE - totalArc / 2;

    return cards.value.map((_, index) => {
      if (isFinalLayout.value) {
        const column = index % FINAL_LAYOUT_COLUMNS;
        const row = Math.floor(index / FINAL_LAYOUT_COLUMNS);
        const x =
          (column - (FINAL_LAYOUT_COLUMNS - 1) / 2) *
          FINAL_LAYOUT_COLUMN_SPACING;
        const y =
          (row - 0.5) * FINAL_LAYOUT_ROW_SPACING + FINAL_LAYOUT_OFFSET_Y;

        return {
          transform: `translate(${x}px, ${y}px) rotate(0deg)`,
          '--card-layout-transition-duration': `${FINAL_LAYOUT_TRANSITION_MS}ms`,
          '--z-index': count - index
        };
      }

      const angle = startAngle + index * CARD_FAN_ANGLE_STEP;
      const radian = (angle * Math.PI) / 180;
      const x = Math.cos(radian) * CARD_FAN_RADIUS;
      const y = Math.sin(radian) * CARD_FAN_RADIUS + 650;
      const rotation = angle + 90;

      return {
        transform:
          dealingStatus.value !== 'waiting'
            ? `translate(${x}px, ${y}px) rotate(${rotation}deg)`
            : 'translate(0px, 80px) rotate(0deg)',
        '--card-layout-transition-duration': `${FINAL_LAYOUT_TRANSITION_MS}ms`,
        '--z-index': count - index
      };
    });
  });

  return {
    cardStyles,
    allRevealed
  };
}
