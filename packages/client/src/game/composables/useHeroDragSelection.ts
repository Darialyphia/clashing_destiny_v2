import type { ComputedRef } from 'vue';
import { useGameUi } from './useGameClient';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import type { Ref } from 'vue';

const DRAG_THRESHOLD_PX = 30;

export const useHeroDragSelection = (
  hero: Ref<CardViewModel>,
  canSelectHero: ComputedRef<boolean>
) => {
  let startX = 0;
  let startY = 0;

  const ui = useGameUi();

  const onMousemove = (e: MouseEvent) => {
    const deltaY = Math.abs(startY - e.clientY);
    const deltaX = Math.abs(startX - e.clientX);
    if (deltaY >= DRAG_THRESHOLD_PX || deltaX >= DRAG_THRESHOLD_PX) {
      ui.value.selectHero(hero.value);
      document.body.removeEventListener('mousemove', onMousemove);
    }
  };

  const onMousedown = (e: MouseEvent) => {
    if (!canSelectHero.value) return;
    startX = e.clientX;
    startY = e.clientY;

    document.body.addEventListener('mousemove', onMousemove);
  };

  const onMouseup = () => {
    document.body.removeEventListener('mousemove', onMousemove);
  };

  ui.value.onReset(() => {
    document.body.removeEventListener('mousemove', onMousemove);
  });

  return {
    onMousedown,
    onMouseup
  };
};
