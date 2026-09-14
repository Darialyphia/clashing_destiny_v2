import { useCssVar, useMediaQuery } from '@vueuse/core';

export const useIsMobile = () => {
  const mobileBreakpoint = useCssVar('--size-lg');
  return useMediaQuery(
    computed(() => {
      return `(max-width: ${mobileBreakpoint.value})`;
    })
  );
};
