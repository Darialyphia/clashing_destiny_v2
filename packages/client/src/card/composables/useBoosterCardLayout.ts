import { computed, type ComputedRef, type Ref } from 'vue';
import type { BoosterPackCardEntry, DealingStatus } from './useBoosterPack';

export function useBoosterCardLayout(
  cards: ComputedRef<BoosterPackCardEntry[]>,
  dealingStatus: Ref<DealingStatus>,
  flippedCards: Ref<Set<number>>
) {
  const cardStyles = computed(() => {
    const count = cards.value.length;
    const radius = 1000;
    const angleStep = 18;
    const totalArc = (count - 1) * angleStep;
    const startAngle = -90 - totalArc / 2;

    return cards.value.map((_, index) => {
      const angle = startAngle + index * angleStep;
      const radian = (angle * Math.PI) / 180;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius + 800;
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
