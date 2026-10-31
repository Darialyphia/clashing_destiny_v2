import type { BoardSpace } from '@game/engine/src/board/board-space.entity';
import type { AnyCard } from '@game/engine/src/card/entities/card.entity';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import type {
  TutorialContext,
  TutorialStepValidationResult
} from '@game/engine/src/tutorial/v2/tutorial';
import { waitFor } from '@game/shared';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import type { MinionCard } from '@game/engine/src/card/entities/minion.entity';

export const dispatchSequence = async (
  ctx: TutorialContext,
  sequence: Array<() => SerializedInput>,
  options: {
    // dispatch the first input right away instead of waiting for the next client update.
    // Needed when nothing else will update the client, like at the start of a turn:
    // snapshots without any change are skipped, so the update would never come.
    immediate?: boolean;
  } = {}
) => {
  let step = 0;
  if (options.immediate && sequence.length > 0) {
    ctx.game.dispatch(sequence[0]());
    step = 1;
    if (sequence.length === 1) return;
  }
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

export const getCardViewModel = (ctx: TutorialContext, card: AnyCard) =>
  ctx.client.state.entities[card.id] as CardViewModel;

export const findCardInHand = (ctx: TutorialContext, blueprintId: string) =>
  ctx.game.playerSystem.player1.cardManager.hand.find(
    card => card.blueprintId === blueprintId
  );

export const makeOpponentPassUntilNextTurn = (ctx: TutorialContext) => {
  const p2 = ctx.game.playerSystem.player2;
  const unsub = ctx.game.on(GAME_EVENTS.TURN_INITATIVE_CHANGE, async event => {
    if (!event.data.newInitiativePlayer.equals(p2)) return;
    await waitFor(500);
    ctx.game.dispatch({ type: 'pass', payload: { playerId: p2.id } });
  });
  ctx.game.once(GAME_EVENTS.TURN_START, unsub);
};

export const makeOpponentChooseAffinity = (ctx: TutorialContext) => {
  const p2 = ctx.game.playerSystem.player2;
  let hasChosen = false;
  const stop = ctx.client.onUpdateCompleted(async () => {
    if (hasChosen) return;
    if (ctx.game.interaction.getState() !== INTERACTION_STATES.CHOOSING_CARDS) {
      return;
    }
    hasChosen = true;
    stop();
    await waitFor(300);
    ctx.game.dispatch({
      type: 'chooseCards',
      payload: { playerId: p2.id, indices: [0] }
    });
  });
};

export type BattlefieldZone =
  | typeof CARD_LOCATIONS.LEFT_BATTLEFIELD
  | typeof CARD_LOCATIONS.RIGHT_BATTLEFIELD;

// each battlefield has a single destiny card, owned by one of the two players
export const getDestinyCard = (ctx: TutorialContext, zone: BattlefieldZone) => {
  const key =
    zone === CARD_LOCATIONS.LEFT_BATTLEFIELD
      ? 'leftBattlefield'
      : 'rightBattlefield';
  return (ctx.game.playerSystem.player1.boardSide[key].destinyCard ??
    ctx.game.playerSystem.player2.boardSide[key].destinyCard)!;
};

export const findOpponentMinion = (ctx: TutorialContext, blueprintId: string) =>
  ctx.game.playerSystem.player2.minions.find(
    minion => minion.blueprintId === blueprintId
  );

export const findOpponentCardInHand = (
  ctx: TutorialContext,
  blueprintId: string
) =>
  ctx.game.playerSystem.player2.cardManager.hand.find(
    card => card.blueprintId === blueprintId
  )!;

export const getEmptyBaseSpaces = (ctx: TutorialContext) =>
  ctx.game.playerSystem.player1.boardSide.base.filter(space => space.isEmpty);

export const cardInHandElement = (ctx: TutorialContext, card: AnyCard) => {
  if (card.location !== CARD_LOCATIONS.HAND) return null;
  return ctx.client.ui.DOMSelectors.cardInHand(
    card.id,
    ctx.game.playerSystem.player1.id
  ).element;
};

export const cardOnBoardElement = (ctx: TutorialContext, card: AnyCard) =>
  ctx.client.ui.DOMSelectors.cardOnBoard(card.id).element;

export const emptyBaseSpaceElement = (ctx: TutorialContext) => {
  const [space] = getEmptyBaseSpaces(ctx);
  if (!space) return null;
  return ctx.client.ui.DOMSelectors.boardSpace(space.id).element;
};

export const supplyZoneElement = (ctx: TutorialContext) =>
  ctx.client.ui.DOMSelectors.supplyZone(ctx.game.playerSystem.player1.id)
    .element;

export const validateScoring = (
  input: SerializedInput,
  allowedMinions: MinionCard[]
) => {
  if (
    input.type === 'score' &&
    allowedMinions.some(minion => minion.id === input.payload.minionId)
  ) {
    return { isValid: true as const };
  }
  return null;
};

/**
 * Simple AI used for the last part of the mission. It only uses the minions on the board:
 * - minions in base move to the battlefield where the opponent is doing the worst
 * - minions on a battlefield attack an enemy there if they can destroy it
 * - otherwise they score, highest influence first
 * - when nothing else can be done, it passes
 */
export const startOpponentAI = (ctx: TutorialContext) => {
  const p2 = ctx.game.playerSystem.player2;

  const chooseAffinity = () => {
    const { ctx: interactionCtx } =
      ctx.game.interaction.getContext<'choosing_cards'>();
    const isWaitingForOpponent = interactionCtx
      .serialize()
      .players.includes(p2.id);
    if (!isWaitingForOpponent) return;

    return ctx.game.dispatch({
      type: 'chooseCards',
      payload: { playerId: p2.id, indices: [0] }
    });
  };

  const takeTurnAction = () => {
    const minionToMove = p2.minionsInBase.find(
      minion => minion.canMoveManually
    );
    const destination = [
      p2.boardSide.leftBattlefield,
      p2.boardSide.rightBattlefield
    ]
      .map(battlefield => ({
        battlefield,
        space: battlefield.spaces.find(space => space.isEmpty)
      }))
      .filter(candidate => candidate.space)
      .sort(
        (a, b) =>
          a.battlefield.commandmentScore -
          a.battlefield.opponentCommandmentScore -
          (b.battlefield.commandmentScore -
            b.battlefield.opponentCommandmentScore)
      )[0];
    if (minionToMove && destination) {
      return ctx.game.dispatch({
        type: 'move',
        payload: {
          playerId: p2.id,
          cardId: minionToMove.id,
          zone: destination.battlefield.zone,
          index: destination.space!.index
        }
      });
    }

    const readyMinions = p2.minions
      .filter(minion => minion.isOnBattlefield && !minion.isExhausted)
      .sort((a, b) => b.commandment - a.commandment);

    for (const minion of readyMinions) {
      const target = (minion.potentialAttackTargets as MinionCard[])
        .filter(enemy => enemy.remainingHp <= minion.atk)
        // prefer exhausted targets as they cannot strike back
        .sort((a, b) => Number(b.isExhausted) - Number(a.isExhausted))[0];

      if (target) {
        return ctx.game.dispatch({
          type: 'declareAttack',
          payload: {
            playerId: p2.id,
            attackerId: minion.id,
            targetId: target.id
          }
        });
      }
    }

    const scoringMinion = readyMinions.find(minion => minion.canScore);
    if (scoringMinion) {
      return ctx.game.dispatch({
        type: 'score',
        payload: { playerId: p2.id, minionId: scoringMinion.id }
      });
    }

    return ctx.game.dispatch({ type: 'pass', payload: { playerId: p2.id } });
  };

  const act = () => {
    const interactionState = ctx.game.interaction.getState();
    if (interactionState === INTERACTION_STATES.CHOOSING_CARDS) {
      return chooseAffinity();
    }

    const isOpponentTurn =
      ctx.game.gamePhaseSystem.getState() === GAME_PHASES.MAIN &&
      interactionState === INTERACTION_STATES.IDLE &&
      !ctx.game.effectChainSystem.currentChain &&
      ctx.game.turnSystem.initiativePlayer.equals(p2);
    if (!isOpponentTurn) return;

    return takeTurnAction();
  };

  let isThinking = false;
  const run = async () => {
    if (ctx.game.gamePhaseSystem.getState() === GAME_PHASES.GAME_END) {
      stop();
      return;
    }
    // several snapshots can be received for a single input
    // make sure we only take one decision at a time
    if (isThinking) return;
    isThinking = true;
    try {
      await waitFor(700);
      act();
    } finally {
      isThinking = false;
    }
  };

  const stop = ctx.client.onUpdateCompleted(run);
  void run();
};

/**
 * The free play portion at the end of a mission must be won before the turn ends.
 * Call in the step setup, then use isFreePlayFailed as its failedCondition.
 */
export const startFreePlay = (ctx: TutorialContext) => {
  ctx.meta.freePlayTurn = ctx.game.turnSystem.elapsedTurns;
};

export const isFreePlayFailed = (ctx: TutorialContext) => {
  if (ctx.game.gamePhaseSystem.getState() === GAME_PHASES.GAME_END) {
    return !ctx.game.gamePhaseSystem.winners.some(player =>
      player.equals(ctx.game.playerSystem.player1)
    );
  }
  return ctx.game.turnSystem.elapsedTurns > ctx.meta.freePlayTurn;
};
