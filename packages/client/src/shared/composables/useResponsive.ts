import { useMediaQuery } from '@vueuse/core';
import { defineStore } from 'pinia';

export const useResponsive = defineStore('responsive', () => {
  const mobileBreakpoint = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--size-lg');
  const tabletBreakpoint = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--size-xl');

  return {
    isSmallViewport: useMediaQuery(
      computed(() => `(max-width: ${mobileBreakpoint})`)
    ),
    isMediumViewport: useMediaQuery(
      computed(() => `(max-width: ${tabletBreakpoint})`)
    ),
    isTouchDevice: useMediaQuery(computed(() => '(pointer: coarse)'))
  };
});
