import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { INTERACTION_STATES } from '@game/engine/src/game/game.enums';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import {
  useGameClient,
  useGameState,
  useGameUi
} from '../../composables/useGameClient';

export const useBoardCardInteraction = (card: CardViewModel) => {
  const ui = useGameUi();
  const { client } = useGameClient();
  const state = useGameState();

  const isSelected = computed(() => ui.value.selectedCard?.equals(card));

  const hasAvailableAbilities = computed(() => {
    return card.abilityActions.some(ability => {
      return ability.predicate();
    });
  });

  const isTargetable = computed(() => {
    if (state.value.interaction.state === INTERACTION_STATES.IDLE) {
      if (card.kind !== CARD_KINDS.DESTINY) return false;
      if (!ui.value.selectedCard) return false;
      if (ui.value.selectedCard.kind !== CARD_KINDS.MINION) return false;
      if (
        ui.value.selectedCard.canScore &&
        ui.value.selectedCard.location === card.location
      ) {
        return true;
      }
    }
    if (
      state.value.interaction.state !==
      INTERACTION_STATES.SELECTING_CARDS_ON_BOARD
    ) {
      return false;
    }
    if (!client.value.isActive()) {
      return false;
    }

    return state.value.interaction.ctx.elligibleCards.some(
      cardId => cardId === card.id
    );
  });

  const canAttack = computed(() => {
    if (!ui.value.selectedCard) return false;

    return ui.value.selectedCard.canAttackAt(card);
  });

  const onMouseup = (e: MouseEvent) => {
    if (e.button !== 0) return;

    const action = card.currentClickAction;
    if (!action) return;
    e.stopPropagation();

    action.handler(card);
  };

  return {
    isSelected,
    hasAvailableAbilities,
    isTargetable,
    canAttack,
    onMouseup
  };
};
