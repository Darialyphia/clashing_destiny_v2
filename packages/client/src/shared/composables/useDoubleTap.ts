import { useEventListener } from '@vueuse/core';
import { useResponsive } from '@/shared/composables/useResponsive';

export type DoubleTapOptions = {
  interval?: number;
};

export const useDoubleTap = <T extends HTMLElement>(
  target: MaybeRefOrGetter<T | null | undefined>,
  callback: (event: TouchEvent) => void,
  options: DoubleTapOptions = {}
) => {
  const { isTouchDevice } = useResponsive();
  const interval = options.interval ?? 300;
  let lastTapAt = 0;

  return useEventListener(target, 'touchend', event => {
    if (!isTouchDevice.value) return;

    const now = Date.now();

    if (now - lastTapAt <= interval) {
      lastTapAt = 0;
      event.stopPropagation();
      callback(event);
      return;
    }

    lastTapAt = now;
  });
};
