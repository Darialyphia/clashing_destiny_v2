import { waitFor } from '@game/shared';
import { until } from '@vueuse/core';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useFxEvent } from './useGameClient';

type SequenceEndCallback = (ctx: { animationSequence: string[] }) => void;

export const useBoardCardFxEvents = (
  card: CardViewModel,
  unitEl: Ref<HTMLElement | null>,
  {
    onAttack,
    onDestroy,
    onHit,
    onSequenceEnd
  }: {
    onAttack: () => void;
    onDestroy: () => void;
    onHit: () => void;
    onSequenceEnd: (cb: SequenceEndCallback) => () => void;
  }
) => {
  const isBeingPlayed = ref(false);
  const DROP_DURATION = 300;

  useFxEvent(FX_EVENTS.CARD_AFTER_PLAY, async event => {
    if (event.card.id !== card.id) return;
    isBeingPlayed.value = true;
    await waitFor(DROP_DURATION);
    isBeingPlayed.value = false;
  });

  const isAttacking = ref(false);
  useFxEvent(FX_EVENTS.CARD_BEFORE_DEAL_COMBAT_DAMAGE, event => {
    if (event.card !== card.id) return;

    if (!unitEl.value) return;
    const _unitEl = unitEl.value;

    return new Promise<void>(resolve => {
      onAttack();

      const stop = onSequenceEnd(() => {
        isAttacking.value = true;

        _unitEl.addEventListener(
          'animationend',
          () => {
            isAttacking.value = false;
          },
          { once: true }
        );

        until(isAttacking)
          .toBe(false)
          .then(() => {
            stop();
            resolve();
          });
      });
    });
  });

  const isTakingDamage = ref(false);
  useFxEvent(FX_EVENTS.CARD_BEFORE_TAKE_DAMAGE, async event => {
    if (event.card !== card.id) return;

    if (!unitEl.value) return;
    isTakingDamage.value = true;
    unitEl.value.addEventListener(
      'animationend',
      () => {
        isTakingDamage.value = false;
      },
      { once: true }
    );

    await until(isTakingDamage).toBe(false);
    return new Promise(resolve => {
      onHit();
      const stop = onSequenceEnd(() => {
        resolve();
        stop();
      });
    });
  });

  useFxEvent(FX_EVENTS.CARD_WAKE_UP, async event => {
    if (event.card !== card.id) return;
    card.update({ isExhausted: false });
  });

  useFxEvent(FX_EVENTS.CARD_EXHAUST, async event => {
    if (event.card !== card.id) return;
    card.update({ isExhausted: true });
  });

  useFxEvent(FX_EVENTS.CARD_BEFORE_DESTROY, async event => {
    if (event.card !== card.id) return;
    return new Promise(resolve => {
      onDestroy();

      const stop = onSequenceEnd(() => {
        console.log('sequence end');
        resolve();
        stop();
      });
    });
  });

  return {
    isBeingPlayed,
    DROP_DURATION,
    isAttacking,
    isTakingDamage
  };
};
