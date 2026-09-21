import { ref, watch, type ComputedRef, type Ref } from 'vue';
import gsap from 'gsap';
import { RARITIES } from '@game/engine/src/card/card.enums';
import type { BoosterPackCardEntry, DealingStatus } from './useBoosterPack';
import { unrefElement } from '@vueuse/core';

export function useBoosterRevealState(
  cards: ComputedRef<BoosterPackCardEntry[]>,
  dealingStatus: Ref<DealingStatus>,
  wrapperRefs: Ref<Array<HTMLElement | null>>,
  containerRef: Ref<HTMLElement | null>,
  triggerPixiExplosion: (x: number, y: number) => void
) {
  const flippedCards = ref<Set<number>>(new Set());
  const isSweeping = ref(false);
  const boosterId = ref(0);

  const isRevealed = (index: number) => flippedCards.value.has(index);

  const triggerLegendaryShake = () => {
    if (!containerRef.value) return;
    gsap.fromTo(
      containerRef.value,
      { x: 0, y: 0 },
      {
        x: () => (Math.random() - 0.5) * 30,
        y: () => (Math.random() - 0.5) * 30,
        duration: 0.05,
        repeat: 10,
        yoyo: true,
        clearProps: 'x,y',
        ease: 'power1.inOut',
        onComplete: () => {
          console.log('Legendary shake complete');
        }
      }
    );
  };

  const reveal = (index: number) => {
    if (dealingStatus.value !== 'done' || flippedCards.value.has(index)) return;

    flippedCards.value.add(index);
    const card = cards.value[index];

    if (card?.blueprint.rarity === RARITIES.LEGENDARY) {
      triggerLegendaryShake();
      const elements = wrapperRefs.value.map(el => unrefElement(el));
      const target = elements.find(el => el?.id === `booster-card-${index}`);
      if (target) {
        const rect = target.getBoundingClientRect();
        triggerPixiExplosion(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
      }
    }
  };

  const onCardHover = (index: number) => {
    if (
      isSweeping.value &&
      dealingStatus.value === 'done' &&
      !flippedCards.value.has(index)
    ) {
      reveal(index);
    }
  };

  watch(cards, () => {
    flippedCards.value.clear();
    boosterId.value += 1;
  });

  return {
    flippedCards,
    isSweeping,
    boosterId,
    isRevealed,
    reveal,
    onCardHover
  };
}
