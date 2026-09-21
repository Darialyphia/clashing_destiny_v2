import { match } from 'ts-pattern';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import {
  ANIMATIONS_NAMES,
  type AnimationName
} from '@game/engine/src/game/game.enums';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

type AnimationData = {
  sequence: AnimationName[] | undefined;
  shouldRepeat: boolean;
  shouldResetOnEnd: boolean;
};
const CARD_ANIMATION_SEQUENCES: Record<string, AnimationData> = {
  idle: {
    sequence: undefined, // use fallback animation
    shouldRepeat: true,
    shouldResetOnEnd: true
  },
  attack: {
    sequence: [ANIMATIONS_NAMES.ATTACK],
    shouldRepeat: false,
    shouldResetOnEnd: true
  },
  death: {
    sequence: [ANIMATIONS_NAMES.DEATH],
    shouldRepeat: false,
    shouldResetOnEnd: false
  },
  hit: {
    sequence: [ANIMATIONS_NAMES.HIT],
    shouldRepeat: false,
    shouldResetOnEnd: true
  }
};

export const useBoardCardAnimationSequence = (card: CardViewModel) => {
  const animationSequence = ref<AnimationName[] | undefined>(undefined);
  const shouldRepeat = ref(true);
  const shouldResetOnEnd = ref(true);

  const resetAnimationSequence = () => {
    animationSequence.value = undefined;
    shouldRepeat.value = true;
    shouldResetOnEnd.value = true;
  };

  const onAnimationSequenceEndCallbacks: ((ctx: {
    animationSequence: string[];
  }) => void)[] = [];
  const addOnAnimationSequenceEndCallback = (
    cb: (ctx: { animationSequence: string[] }) => void
  ) => {
    onAnimationSequenceEndCallbacks.push(cb);

    return () => {
      const index = onAnimationSequenceEndCallbacks.indexOf(cb);
      if (index !== -1) {
        onAnimationSequenceEndCallbacks.splice(index, 1);
      }
    };
  };

  const onAnimationSequenceEnd = () => {
    onAnimationSequenceEndCallbacks.forEach(cb =>
      cb({ animationSequence: animationSequence.value ?? [] })
    );
    if (shouldResetOnEnd.value) {
      resetAnimationSequence();
    }
  };

  const playSelectedAnimationSequence = () => {
    animationSequence.value = match(card.kind)
      .with(CARD_KINDS.MINION, () => [ANIMATIONS_NAMES.IDLE])
      .with(CARD_KINDS.ARTIFACT, () => [ANIMATIONS_NAMES.ACTIVE])
      .with(
        CARD_KINDS.SPELL,
        CARD_KINDS.DESTINY,
        CARD_KINDS.RUNE,
        CARD_KINDS.SECRET,
        () => [ANIMATIONS_NAMES.DEFAULT]
      )
      .exhaustive();
  };

  const playAttackAnimationSequence = () => {
    if (card.kind !== CARD_KINDS.MINION) {
      onAnimationSequenceEnd();
      return;
    }
    animationSequence.value = CARD_ANIMATION_SEQUENCES.attack.sequence;
    shouldRepeat.value = CARD_ANIMATION_SEQUENCES.attack.shouldRepeat;
    shouldResetOnEnd.value = CARD_ANIMATION_SEQUENCES.attack.shouldResetOnEnd;
  };

  const playDeathAnimationSequence = () => {
    if (card.kind !== CARD_KINDS.MINION) {
      onAnimationSequenceEnd();
      return;
    }
    animationSequence.value = CARD_ANIMATION_SEQUENCES.death.sequence;
    shouldRepeat.value = CARD_ANIMATION_SEQUENCES.death.shouldRepeat;
    shouldResetOnEnd.value = CARD_ANIMATION_SEQUENCES.death.shouldResetOnEnd;
  };

  const playHitSequence = () => {
    if (card.kind !== CARD_KINDS.MINION) {
      onAnimationSequenceEnd();
      return;
    }
    animationSequence.value = CARD_ANIMATION_SEQUENCES.hit.sequence;
    shouldRepeat.value = CARD_ANIMATION_SEQUENCES.hit.shouldRepeat;
    shouldResetOnEnd.value = CARD_ANIMATION_SEQUENCES.hit.shouldResetOnEnd;
  };

  return {
    animationSequence,
    resetAnimationSequence,
    addOnAnimationSequenceEndCallback,
    onAnimationSequenceEnd,
    playSelectedAnimationSequence,
    playAttackAnimationSequence,
    playDeathAnimationSequence,
    playHitSequence,
    shouldRepeat
  };
};
