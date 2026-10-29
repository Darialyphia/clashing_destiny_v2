import type { BoardSpace } from '@game/engine/src/board/board-space.entity';
import type { AnyCard } from '@game/engine/src/card/entities/card.entity';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import type {
  TutorialContext,
  TutorialStepValidationResult
} from '@game/engine/src/tutorial/v2/tutorial';
import { waitFor } from '@game/shared';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

export const dispatchSequence = async (
  ctx: TutorialContext,
  sequence: Array<() => SerializedInput>
) => {
  let step = 0;
  const stop = ctx.client.onUpdateCompleted(async () => {
    await waitFor(100);
    if (step < sequence.length) {
      ctx.game.dispatch(sequence[step]());
      step++;
    }
    if (step >= sequence.length) {
      stop();
    }
  });
};

export const validatePlayingCard = (
  cardToPlay: AnyCard,
  input: SerializedInput,
  ctx: TutorialContext,
  followupSpaces: BoardSpace[]
): TutorialStepValidationResult => {
  const gamePhaseState = ctx.game.gamePhaseSystem.getState();
  if (gamePhaseState === GAME_PHASES.MAIN) {
    if (
      input.type !== 'declarePlayCard' ||
      input.payload.id !== cardToPlay.id
    ) {
      return {
        isValid: false,
        reason: `Play the ${cardToPlay.blueprint.name} in your hand.`
      };
    }
  } else {
    if (
      input.type !== 'selectSpaceOnBoard' &&
      input.type !== 'cancelInteraction' &&
      input.type !== 'cancelPlayingCard'
    ) {
      return {
        isValid: false,
        reason: 'Drag your card on the highlighted space.'
      };
    }
    if (input.type === 'selectSpaceOnBoard') {
      const spaceIds = followupSpaces.map(space => space.id);
      if (!spaceIds.includes(input.payload.id)) {
        return {
          isValid: false,
          reason: 'Drag your card on the highlighted space.'
        };
      }
    }
  }
  return {
    isValid: true
  };
};

export const validateSupplyCard = (
  cardToSupply: AnyCard,
  input: SerializedInput,
  ctx: TutorialContext
): TutorialStepValidationResult => {
  const gamePhaseState = ctx.game.gamePhaseSystem.getState();
  if (gamePhaseState === GAME_PHASES.MAIN) {
    if (input.type !== 'declarePlayCard') {
      return {
        isValid: false,
        reason: `Put your ${cardToSupply.blueprint.name} in the Supply Zone.`
      };
    }
    if (input.payload.id !== cardToSupply.id) {
      return {
        isValid: false,
        reason: `Put your ${cardToSupply.blueprint.name} in the Supply Zone.`
      };
    }
  } else if (
    input.type !== 'supplyCard' &&
    input.type !== 'cancelInteraction' &&
    input.type !== 'cancelPlayingCard'
  ) {
    return {
      isValid: false,
      reason: `Put your ${cardToSupply.blueprint.name} in the Supply Zone.`
    };
  }
  return {
    isValid: true
  };
};

export const validateMovingMinion = (
  minionToMove: AnyCard,
  input: SerializedInput,
  designatedSpace: BoardSpace
): TutorialStepValidationResult => {
  if (input.type !== 'move') {
    return {
      isValid: false,
      reason: 'Move your minion to the specified space'
    };
  }
  if (input.payload.cardId !== minionToMove.id) {
    return {
      isValid: false,
      reason: `Move your ${minionToMove.blueprint.name}`
    };
  }
  if (
    input.payload.zone !== designatedSpace.position.zone ||
    input.payload.index !== designatedSpace.index
  ) {
    return {
      isValid: false,
      reason: 'Move your minion to the designated space'
    };
  }
  return {
    isValid: true
  };
};

export const validatePlayingSpell = (
  spell: AnyCard,
  input: SerializedInput,
  ctx: TutorialContext,
  allowedTargets: AnyCard[]
): TutorialStepValidationResult => {
  const gamePhaseState = ctx.game.gamePhaseSystem.getState();
  if (gamePhaseState === GAME_PHASES.MAIN) {
    if (input.type !== 'declarePlayCard' || input.payload.id !== spell.id) {
      return {
        isValid: false,
        reason: `Play the ${spell.blueprint.name} in your hand.`
      };
    }
    return { isValid: true };
  }

  if (
    input.type === 'cancelInteraction' ||
    input.type === 'cancelPlayingCard'
  ) {
    return { isValid: true };
  }

  const targetNames = [
    ...new Set(allowedTargets.map(target => target.blueprint.name))
  ].join(' or ');
  if (input.type !== 'selectCardOnBoard') {
    return {
      isValid: false,
      reason: `Drag your ${spell.blueprint.name} onto the ${targetNames}.`
    };
  }
  if (!allowedTargets.some(target => target.id === input.payload.cardId)) {
    return {
      isValid: false,
      reason: `Target the ${targetNames} with your ${spell.blueprint.name}.`
    };
  }

  return { isValid: true };
};
