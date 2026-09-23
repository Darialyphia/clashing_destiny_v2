import { useCssVar, useMediaQuery } from '@vueuse/core';

export const useResponsive = () => {
  const mobileBreakpoint = useCssVar('--size-lg');
  const tabletBreakpoint = useCssVar('--size-xl');
  return {
    isSmallViewport: useMediaQuery(
      computed(() => `(max-width: ${mobileBreakpoint.value})`)
    ),
    isMediumViewport: useMediaQuery(
      computed(() => `(max-width: ${tabletBreakpoint.value})`)
    ),
    isTouchDevice: useMediaQuery(computed(() => '(pointer: coarse)'))
  };
};
