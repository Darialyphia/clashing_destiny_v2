import { computed, type ComputedRef, type Ref } from 'vue';
import type { BoosterPackCardEntry, DealingStatus } from './useBoosterPack';

const CARD_FAN_RADIUS = 800;
const CARD_FAN_START_ANGLE = -90;

const CARD_FAN_ANGLE_STEP = 12;

export function useBoosterCardLayout(
  cards: ComputedRef<BoosterPackCardEntry[]>,
  dealingStatus: Ref<DealingStatus>,
  flippedCards: Ref<Set<number>>
) {
  const cardStyles = computed(() => {
    const count = cards.value.length;

    const totalArc = (count - 1) * CARD_FAN_ANGLE_STEP;
    const startAngle = CARD_FAN_START_ANGLE - totalArc / 2;

    return cards.value.map((_, index) => {
      const angle = startAngle + index * CARD_FAN_ANGLE_STEP;
      const radian = (angle * Math.PI) / 180;
      const x = Math.cos(radian) * CARD_FAN_RADIUS;
      const y = Math.sin(radian) * CARD_FAN_RADIUS + 650;
      const rotation = angle + 90;

      return {
        transform:
          dealingStatus.value !== 'waiting'
            ? `translate(${x}px, ${y}px) rotate(${rotation}deg)`
            : `translate(0px, 80px rotate(0deg)`,
        '--z-index': count - index
      };
    });
  });

  const allRevealed = computed(
    () => flippedCards.value.size === cards.value.length
  );

  return {
    cardStyles,
    allRevealed
  };
}
