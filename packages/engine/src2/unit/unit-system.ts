import { isDefined, type Point } from '@game/shared';
import { System } from '../system';
import { Unit } from './unit.entity';
import { MinionCard } from '../card/entities/minion-card.entity';
import type { Player } from '../player/player.entity';
import type { GenericAOEShape } from '../aoe/aoe-shape';
import { isValidTargetingType } from '../targeting/targeting-strategy';

// eslint-disable-next-line @typescript-eslint/ban-types
export type UnitSystemOptions = {};

export class UnitSystem extends System<UnitSystemOptions> {
  private unitMap = new Map<string, Unit>();

  private nextUnitId = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize() {}

  shutdown() {}

  get units() {
    return [...this.unitMap.values()];
  }

  getUnitById(id: string) {
    return this.unitMap.get(id) ?? null;
  }

  getUnitByCard(card: MinionCard) {
    return this.units.find(unit => unit.card.equals(card)) ?? null;
  }

  getUnitsByPlayer(player: Player) {
    return this.units.filter(unit => unit.player.equals(player));
  }

  getUnitAt(position: Point) {
    return (
      this.units.find(e => {
        return e.isAt(position);
      }) ?? null
    );
  }

  getNearbyUnits({ x, y }: Point) {
    return this.game.boardSystem
      .getNeighbors({ x, y })
      .map(cell => cell.unit)
      .filter(isDefined);
  }

  addUnit(card: MinionCard, position: Point) {
    const id = `unit_${++this.nextUnitId}`;
    const unit = new Unit(this.game, card, { id, position });
    this.unitMap.set(unit.id, unit);

    return unit;
  }

  removeUnit(unit: Unit) {
    this.unitMap.delete(unit.id);
    if (unit.card instanceof MinionCard) {
      unit.player.cardManager.sendToDiscardPile(unit.card);
    }
  }

  getUnitsInAOE(aoe: GenericAOEShape, points: Point[], player: Player) {
    return aoe
      .getArea(points)
      .filter(point => isValidTargetingType(this.game, point, player, aoe.targetingType))
      .map(point => this.getUnitAt(point))
      .filter(isDefined);
  }

  getNearestUnitInFront(unit: Unit) {
    const diff = unit.player.isPlayer1 ? 1 : -1;
    for (let x = unit.x + diff; x >= 0 && x < this.game.boardSystem.width; x += diff) {
      const point = { x, y: unit.y };
      const foundUnit = this.getUnitAt(point);
      if (foundUnit) {
        return foundUnit;
      }
    }
    return null;
  }

  getNearestUnitBehind(unit: Unit) {
    const diff = unit.player.isPlayer1 ? -1 : 1;
    for (let x = unit.x + diff; x >= 0 && x < this.game.boardSystem.width; x += diff) {
      const point = { x, y: unit.y };
      const foundUnit = this.getUnitAt(point);
      if (foundUnit) {
        return foundUnit;
      }
    }
    return null;
  }

  getNearestUnitAbove(unit: Unit) {
    for (let y = unit.y - 1; y >= 0; y--) {
      const point = { x: unit.x, y };
      const foundUnit = this.getUnitAt(point);
      if (foundUnit) {
        return foundUnit;
      }
    }
    return null;
  }

  getNearestUnitBelow(unit: Unit) {
    for (let y = unit.y + 1; y < this.game.boardSystem.height; y++) {
      const point = { x: unit.x, y };
      const foundUnit = this.getUnitAt(point);
      if (foundUnit) {
        return foundUnit;
      }
    }
    return null;
  }
}
