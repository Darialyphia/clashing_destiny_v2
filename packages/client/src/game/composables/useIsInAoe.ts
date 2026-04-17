import { makeAoeShape } from '@game/engine/src/aoe/aoe-shape.factory';
import {
  GAME_PHASES,
  INTERACTION_STATES
} from '@game/engine/src/game/game.enums';
import { TARGETING_TYPE } from '@game/engine/src/targeting/targeting-strategy';
import { isDefined, type Point, Vec2 } from '@game/shared';
import {
  useGameState,
  useGameUi,
  useMyPlayer,
  useUnits
} from './useGameClient';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { match } from 'ts-pattern';

export const useIsInAoe = () => {
  const ui = useGameUi();
  const myPlayer = useMyPlayer();
  const state = useGameState();
  const units = useUnits();

  const isTargeted = ({ x, y }: Point) => {
    const { interaction, phase } = state.value;
    if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return false;
    }

    if (
      interaction.ctx.selectedSpaces.some(
        space => pointToCellId(space) === pointToCellId({ x, y })
      )
    ) {
      return true;
    }

    if (phase.state === GAME_PHASES.PLAYING_CARD) {
      const card = state.value.entities[phase.ctx.card] as CardViewModel;
      if (!card) return false;
      return card.spacesToHighlight.some(point =>
        Vec2.fromPoint(point).equals({ x, y })
      );
    }

    return false;
  };

  const isInAoe = ({ x, y }: Point) => {
    if (isTargeted({ x, y })) return false;
    const { interaction } = state.value;
    if (interaction.state !== INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return false;
    }
    if (!interaction.ctx.aoe.shape) return false;

    const shape = makeAoeShape(
      interaction.ctx.aoe.shape.type,
      interaction.ctx.aoe.shape.targetingType,
      interaction.ctx.aoe.shape.params
    );

    const targets = [
      ...interaction.ctx.selectedSpaces,
      ui.value.hoveredCell?.position
    ].filter(isDefined);
    const area = shape.getArea(targets);
    const isInArea = area.some(point => point.x === x && point.y === y);
    if (!isInArea) return false;
    const unitOnPosition = units.value.find(u => u.x === x && u.y === y);

    const isValidTargetingType = match(shape.targetingType)
      .with(TARGETING_TYPE.ANYWHERE, () => true)
      .with(TARGETING_TYPE.EMPTY, () => !unitOnPosition)
      .with(TARGETING_TYPE.UNIT, () => !!unitOnPosition)
      .with(
        TARGETING_TYPE.ENEMY_UNIT,
        () => !unitOnPosition?.getPlayer()?.equals(myPlayer.value)
      )
      .with(TARGETING_TYPE.ALLY_UNIT, () =>
        unitOnPosition?.getPlayer()?.equals(myPlayer.value)
      )
      .exhaustive();

    return isValidTargetingType;
  };

  return isInAoe;
};
