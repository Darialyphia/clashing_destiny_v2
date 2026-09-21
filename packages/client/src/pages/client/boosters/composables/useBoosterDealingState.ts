import { ref, type ComputedRef, type Ref } from 'vue';
import gsap from 'gsap';
import type { BoosterPackCardEntry, DealingStatus } from './useBoosterPack';

const MIN_SHAKE_TIME = 1500;

const asElement = (candidate: unknown): HTMLElement | null => {
  if (!candidate) return null;
  if (candidate instanceof HTMLElement) return candidate;
  const possibleComponent = candidate as { $el?: unknown };
  return possibleComponent && possibleComponent.$el instanceof HTMLElement
    ? possibleComponent.$el
    : null;
};

export function useBoosterDealingState(
  cards: ComputedRef<BoosterPackCardEntry[]>,
  wrapperRefs: Ref<Array<HTMLElement | null>>
) {
  const dealingStatus = ref<DealingStatus>('waiting');
  const isShaking = ref(false);
  const isDealScheduled = ref(false);

  const shakeTween = ref<gsap.core.Tween | null>(null);
  const shakeStartTime = ref(0);

  const getWrapperElements = () =>
    wrapperRefs.value
      .map(asElement)
      .filter((el): el is HTMLElement => Boolean(el));

  const startShaking = () => {
    if (isDealScheduled.value) return;
    shakeStartTime.value = Date.now();
    let shakeCounter = 0;

    const shake = () => {
      shakeCounter += 0.5;
      const targets = getWrapperElements();
      if (!targets.length) return;
      shakeTween.value = gsap.to(targets, {
        x: `random(-${5 + shakeCounter}, ${5 + shakeCounter})`,
        y: `random(-${5 + shakeCounter}, ${5 + shakeCounter})`,
        duration: 0.05,
        onComplete: shake
      });
    };

    shakeTween.value?.kill();
    isShaking.value = true;
    shake();
  };

  const stopShakingAndDeal = () => {
    if (isDealScheduled.value || !shakeTween.value) return;
    isShaking.value = false;
    isDealScheduled.value = true;

    const elapsed = Date.now() - shakeStartTime.value;
    const remaining = Math.max(0, MIN_SHAKE_TIME - elapsed);

    setTimeout(() => {
      shakeTween.value?.kill();
      shakeTween.value = null;

      dealingStatus.value = 'dealing';
      setTimeout(
        () => {
          dealingStatus.value = 'done';
          isDealScheduled.value = false;
        },
        (cards.value.length + 1) * 50
      );

      const targets = getWrapperElements();
      if (targets.length) {
        gsap.to(targets, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.05,
          clearProps: 'all'
        });
      }
    }, remaining);
  };

  return {
    dealingStatus,
    isShaking,
    startShaking,
    stopShakingAndDeal
  };
}
