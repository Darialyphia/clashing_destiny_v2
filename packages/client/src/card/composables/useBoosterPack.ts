import {
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref
} from 'vue';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { useSafeInject } from '@/shared/composables/useSafeInject';
import { useBoosterPixiEffects } from './useBoosterPixiEffects';
import { useBoosterDealingState } from './useBoosterDealingState';
import { useBoosterRevealState } from './useBoosterRevealState';
import { useBoosterCardLayout } from './useBoosterCardLayout';

export type DealingStatus = 'waiting' | 'dealing' | 'done';

export interface BoosterPackCardEntry {
  blueprint: CardBlueprint;
  isFoil: boolean;
}

export type BoosterPackContext = {
  cards: ComputedRef<BoosterPackCardEntry[]>;
  flippedCards: Ref<Set<number>>;
  isRevealed: (index: number) => boolean;
  dealingStatus: Ref<DealingStatus>;
  isSweeping: Ref<boolean>;
  isShaking: Ref<boolean>;
  startShaking: () => void;
  stopShakingAndDeal: () => void;
  startSweep: (index: number) => void;
  endSweep: () => void;
  onCardHover: (index: number) => void;
  reveal: (index: number) => void;
  wrapperRefs: Ref<Array<HTMLElement | null>>;
  containerRef: Ref<HTMLElement | null>;
  canvasContainerRef: Ref<HTMLElement | null>;
  triggerLegendaryShake: () => void;
  triggerPixiExplosion: (x: number, y: number) => void;
  cardStyles: ComputedRef<Array<Record<string, string | number>>>;
  allRevealed: ComputedRef<boolean>;
  boosterId: Ref<number>;
};

export const BOOSTER_PACK_INJECTION_KEY = Symbol(
  'BoosterPackContext'
) as InjectionKey<BoosterPackContext>;

export interface ProvideBoosterPackOptions {
  cards: ComputedRef<BoosterPackCardEntry[]>;
}

export const provideBoosterPack = ({
  cards
}: ProvideBoosterPackOptions): BoosterPackContext => {
  const wrapperRefs = ref<Array<HTMLElement | null>>([]);
  const containerRef = ref<HTMLElement | null>(null);
  const canvasContainerRef = ref<HTMLElement | null>(null);

  // Initialize PixiJS effects
  const { triggerPixiExplosion } = useBoosterPixiEffects(canvasContainerRef);

  // Initialize dealing state (shake/deal animations)
  const { dealingStatus, isShaking, startShaking, stopShakingAndDeal } =
    useBoosterDealingState(cards, wrapperRefs);

  // Initialize reveal state (flipped cards, hover, reveal logic)
  const {
    flippedCards,
    isSweeping,
    boosterId,
    isRevealed,
    reveal,
    onCardHover
  } = useBoosterRevealState(
    cards,
    dealingStatus,
    wrapperRefs,
    containerRef,
    triggerPixiExplosion
  );

  // Initialize card layout (positioning/styling)
  const { cardStyles, allRevealed } = useBoosterCardLayout(
    cards,
    dealingStatus,
    flippedCards
  );

  // Sweep interaction handlers
  const startSweep = (index: number) => {
    if (dealingStatus.value === 'waiting') {
      startShaking();
    } else if (dealingStatus.value === 'done') {
      isSweeping.value = true;
      if (!flippedCards.value.has(index)) {
        reveal(index);
      }
    }
  };

  const endSweep = () => {
    if (dealingStatus.value === 'waiting') {
      stopShakingAndDeal();
    }
    isSweeping.value = false;
  };

  // Reset state when cards change
  watch(cards, () => {
    dealingStatus.value = 'waiting';
    isSweeping.value = false;
    isShaking.value = false;
  });

  const context: BoosterPackContext = {
    cards,
    flippedCards,
    isRevealed,
    dealingStatus,
    isSweeping,
    isShaking,
    startShaking,
    stopShakingAndDeal,
    startSweep,
    endSweep,
    onCardHover,
    reveal,
    wrapperRefs,
    containerRef,
    canvasContainerRef,
    triggerLegendaryShake: () => {}, // Exposed via useBoosterRevealState internally
    triggerPixiExplosion,
    cardStyles,
    allRevealed,
    boosterId
  };

  provide(BOOSTER_PACK_INJECTION_KEY, context);

  return context;
};

export const useBoosterPack = () => useSafeInject(BOOSTER_PACK_INJECTION_KEY);
