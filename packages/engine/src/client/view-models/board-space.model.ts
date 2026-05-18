import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';
import { PatchApplier } from '../patch-applier';
import type { PatchOperation } from '../../game/systems/patch-types';
import type { SerializedBoardSpace } from '../../board/board-space.entity';
import type { PlayerViewModel } from './player.model';
import type { CardViewModel } from './card.model';

export class BoardSpaceViewModel {
  private static patchApplier = new PatchApplier();
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedBoardSpace,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: BoardSpaceViewModel | SerializedBoardSpace) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedBoardSpace>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  /**
   * Update using patch operations for granular changes
   */
  updateWithPatches(patches: PatchOperation[]) {
    this.data = BoardSpaceViewModel.patchApplier.applyPatches(this.data, patches);
    return this;
  }

  clone() {
    return new BoardSpaceViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get position() {
    return this.data.position;
  }

  get player() {
    const entities = this.getEntities();

    return entities[this.data.player] as PlayerViewModel;
  }

  get occupant() {
    if (!this.data.occupant) return null;
    const entities = this.getEntities();
    return entities[this.data.occupant] as unknown as CardViewModel;
  }
}
