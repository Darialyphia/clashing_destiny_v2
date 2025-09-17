import { useEventListener, useFullscreen } from '@vueuse/core';
import { throttle } from 'lodash-es';
import type { ShallowRef } from 'vue';

export const useBoardResize = (board: ShallowRef<HTMLElement | null>) => {
  const onResize = throttle(() => {
    if (!board.value) return;
    board.value.style.setProperty('--board-scale', '1');
    const rect = board.value.getBoundingClientRect();

    const width = Math.round(rect.width);
    const screenWidth = window.innerWidth;

    if (width <= screenWidth) return;
    const ratio = screenWidth / width;
    board.value.style.setProperty('--board-scale', ratio.toString());
  }, 50);

  useEventListener(window, 'resize', onResize);
  onMounted(onResize);
  const { isFullscreen } = useFullscreen();
  watch(isFullscreen, onResize);
};
