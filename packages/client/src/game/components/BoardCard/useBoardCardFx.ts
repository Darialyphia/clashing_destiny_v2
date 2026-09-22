import { waitFor } from '@game/shared';
import { until } from '@vueuse/core';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { useFxEvent } from '../../composables/useGameClient';

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
  const latestDamageAmount = ref<number | null>(null);
  useFxEvent(FX_EVENTS.CARD_BEFORE_TAKE_DAMAGE, async event => {
    if (event.card !== card.id) return;

    latestDamageAmount.value = event.amount;
    setTimeout(() => {
      latestDamageAmount.value = null;
    }, 1000);

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

  const isGettingHealed = ref(false);
  const latestHealAmount = ref<number | null>(null);
  useFxEvent(FX_EVENTS.MINION_AFTER_HEAL, async event => {
    if (event.card.id !== card.id) return;

    if (!unitEl.value) return;
    isGettingHealed.value = true;

    latestHealAmount.value = event.amount;
    setTimeout(() => {
      latestHealAmount.value = null;
    }, 1000);

    unitEl.value.addEventListener(
      'animationend',
      () => {
        isGettingHealed.value = false;
      },
      { once: true }
    );

    await until(isGettingHealed).toBe(false);
    return new Promise(resolve => {
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
        stop();
        const sprite = unitEl.value?.querySelector('.sprite') as HTMLElement;
        if (sprite) {
          sprite.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 350,
            fill: 'forwards'
          });
          waitFor(500).then(resolve);
        } else {
          resolve();
        }
      });
    });
  });

  return {
    isBeingPlayed,
    DROP_DURATION,
    isAttacking,
    isTakingDamage,
    isGettingHealed,
    latestDamageAmount,
    latestHealAmount
  };
};
