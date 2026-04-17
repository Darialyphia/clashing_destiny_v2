import type { SerializedUnit } from '../../unit/unit.entity';
import type { PatchOperation } from '../../game/systems/patch-types';
import type { GameClient, GameStateEntities } from '../client';
import type { BoardCellViewModel } from './board-cell.model';
import type { CardViewModel } from './card.model';
import type { ModifierViewModel } from './modifier.model';
import type { PlayerViewModel } from './player.model';

export class UnitViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedUnit,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: UnitViewModel | SerializedUnit) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedUnit>) {
    Object.assign(this.data, data);

    return this;
  }

  updateWithPatches(patches: PatchOperation[]) {
    this.data = this.getClient().patchApplier.applyPatches(this.data, patches);
    return this;
  }

  clone() {
    return new UnitViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get position() {
    return this.data.position;
  }

  get x() {
    return this.data.position.x;
  }

  get y() {
    return this.data.position.y;
  }

  get isExhausted() {
    return this.data.isExhausted;
  }

  get baseMaxHp() {
    return this.data.baseMaxHp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get hp() {
    return this.data.currentHp;
  }

  get baseAtk() {
    return this.data.baseAtk;
  }

  get atk() {
    return this.data.atk;
  }

  get baseRetaliation() {
    return this.data.baseRetaliation;
  }

  get retaliation() {
    return this.data.retaliation;
  }

  get cardId() {
    return this.data.card;
  }

  get isFrontRow() {
    return this.data.isFrontRow;
  }

  get isBackRow() {
    return this.data.isBackRow;
  }

  get canMove() {
    return this.data.canMove;
  }

  canMoveTo(cell: BoardCellViewModel) {
    if (cell.player !== this.getPlayer()?.id) {
      return false;
    }
    if (cell.unit) return false;

    return this.canMove;
  }

  get attackableCells() {
    return this.data.attackableCells;
  }

  canAttackAt(cell: BoardCellViewModel) {
    return this.data.attackableCells.includes(cell.id);
  }

  get card() {
    return this.getEntities()[this.data.card] as CardViewModel;
  }

  getPlayer() {
    const playerId = this.data.player;
    if (!playerId) return null;
    return this.getEntities()[playerId] as PlayerViewModel;
  }

  get modifiers() {
    return this.data.modifiers.map(
      modId => this.getEntities()[modId] as ModifierViewModel
    );
  }
}
