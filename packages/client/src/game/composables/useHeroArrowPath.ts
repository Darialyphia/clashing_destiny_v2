import { useGameClient, useGameState, useGameUi } from './useGameClient';
import { useMouse } from '@vueuse/core';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';

export const useHeroArrowPath = (hero: CardViewModel) => {
  const { client } = useGameClient();
  const ui = useGameUi();
  const state = useGameState();
  const heroPath = ref('');
  const { x, y } = useMouse();

  const pathColor = computed(() => {
    if (
      state.value.interaction.state ===
      INTERACTION_STATES.SELECTING_SPACE_ON_BOARD
    ) {
      return 'lime';
    }
    return 'red';
  });

  const shouldBeDisplayed = computed(() => {
    if (client.value.isPlayingFx) return false;

    const interaction = state.value.interaction;
    if (interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return interaction.ctx.source === hero.id;
    } else if (ui.value.selectedHero) {
      return ui.value.selectedHero.id === hero.id;
    }

    return false;
  });

  const computeParabolaPath = () => {
    if (!shouldBeDisplayed.value) return '';
    const heroEl = ui.value.DOMSelectors.hero(hero.player.id).element;
    if (!heroEl) return '';
    const rect = heroEl.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = x.value;
    const endY = y.value;

    // Control point for quadratic bezier - creates a parabola arc
    // Place it above the midpoint to create an upward arc
    const midX = (startX + endX) / 2;
    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const arcHeight = Math.min(distance * 0.4, 150); // Arc height proportional to distance
    const controlY = Math.min(startY, endY) - arcHeight;

    return `M ${startX} ${startY} Q ${midX} ${controlY} ${endX} ${endY}`;
  };

  watch(
    [() => ui.value.selectedUnit, x, y],
    () => {
      heroPath.value = computeParabolaPath();
    },
    { deep: true }
  );

  return {
    heroPath,
    pathColor
  };
};
