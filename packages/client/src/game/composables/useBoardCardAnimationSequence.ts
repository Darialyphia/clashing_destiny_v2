import { match } from 'ts-pattern';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import {
  ANIMATIONS_NAMES,
  type AnimationName
} from '@game/engine/src/game/game.enums';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

export const useBoardCardAnimationSequence = (card: CardViewModel) => {
  const animationSequence = ref<AnimationName[] | undefined>(undefined);

  const resetAnimationSequence = () => {
    animationSequence.value = undefined;
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
    resetAnimationSequence();
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
    animationSequence.value = [ANIMATIONS_NAMES.ATTACK];
  };

  const playDeathAnimationSequence = () => {
    if (card.kind !== CARD_KINDS.MINION) {
      onAnimationSequenceEnd();
      return;
    }
    animationSequence.value = [ANIMATIONS_NAMES.DEATH];
  };

  const playHitSequence = () => {
    if (card.kind !== CARD_KINDS.MINION) {
      onAnimationSequenceEnd();
      return;
    }
    animationSequence.value = [ANIMATIONS_NAMES.HIT];
  };

  return {
    animationSequence,
    resetAnimationSequence,
    addOnAnimationSequenceEndCallback,
    onAnimationSequenceEnd,
    playSelectedAnimationSequence,
    playAttackAnimationSequence,
    playDeathAnimationSequence,
    playHitSequence
  };
};
