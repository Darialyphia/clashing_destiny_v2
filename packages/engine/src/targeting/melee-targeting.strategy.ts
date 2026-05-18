import { isDefined, type Point3D } from '@game/shared';

import type { Game } from '../game/game';
import { type SpaceTargetingStrategy } from './targeting-strategy';
import type { MinionCard } from '../card/entities/minion.entity';
import { CARD_KINDS } from '../card/card.enums';

export class MeleeTargetingStrategy implements SpaceTargetingStrategy {
  constructor(
    private game: Game,
    private card: MinionCard
  ) {}

  canTargetAt(point: Point3D) {
    if (this.card.position.x !== point.x) return false;
    const space = this.game.boardSystem.getSpaceAt(point);

    if (!space) return false;
    if (space.player.equals(this.card.player)) return false;

    if (!space.occupant) {
      return (
        this.card.position.getCardsOnSamecolumnOfKind(CARD_KINDS.MINION).length === 0
      );
    }
    if (space.isBackRow) {
      return isDefined(space.inFront?.minion);
    }

    return true;
  }
}
