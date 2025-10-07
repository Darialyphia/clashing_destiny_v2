import { useEventListener, useFullscreen } from '@vueuse/core';
import { throttle } from 'lodash-es';
import type { ShallowRef } from 'vue';

export const useBoardResize = (board: ShallowRef<HTMLElement | null>) => {
  const onResize = throttle(() => {
    if (!board.value) return;
    board.value.style.setProperty('--board-scale', '1');

    const width = Math.round(board.value.scrollWidth);
    const height = Math.round(board.value.scrollHeight);
    const visibleWidth = Math.round(board.value.clientWidth);
    const visibleHeight = Math.round(board.value.clientHeight);
    console.log(height, visibleHeight);
    if (width > visibleWidth || height > visibleHeight) {
      const scaleX = visibleWidth / width;
      const scaleY = visibleHeight / height;
      const scale = Math.min(scaleX, scaleY);
      board.value.style.setProperty('--board-scale', scale.toString());
    }
    // console.log(width, height);
    // const scaleX = width / MIN_WIDTH_NEEDED;
    // const scaleY = height / MIN_HEIGHT_NEEDED;
    // const scale = Math.min(scaleX, scaleY);
    // board.value.style.setProperty('--board-scale', scale.toString());
  }, 50);

  useEventListener(window, 'resize', onResize);
  onMounted(onResize);
  const { isFullscreen } = useFullscreen();
  watch(isFullscreen, onResize);
};
