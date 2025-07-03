import { useGameState } from './useGameClient';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { type Ref } from 'vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

export const useHeroSlot = (hero: Ref<CardViewModel>) => {
  const state = useGameState();

  const isHighlighted = computed(() => {
    return (
      (state.value.phase.state === GAME_PHASES.ATTACK &&
        state.value.phase.ctx.potentialTargets.includes(hero.value.id)) ||
      (state.value.interaction.state ===
        INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
        state.value.interaction.ctx.elligibleCards.includes(hero.value.id))
    );
  });

  return { isHighlighted };
};
