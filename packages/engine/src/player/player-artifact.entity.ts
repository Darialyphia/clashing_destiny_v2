import { nanoid } from 'nanoid';
import type { Serializable } from '@game/shared';
import { EntityWithModifiers } from '../utils/entity-with-modifiers';
import type { Game } from '../game/game';
import type { ArtifactCard } from '../card/entities/artifact-card.entity';
import { Interceptable } from '../utils/interceptable';
import { ARTIFACT_EVENTS } from './player.enums';
import {
  ArtifactAfterDurabilityChangeEvent,
  ArtifactBeforeDurabilityChangeEvent,
  ArtifactDestroyEvent,
  ArtifactEquipedEvent
} from './player-artifact.events';

export type PlayerArtifactOptions = {
  card: ArtifactCard;
  playerId: string;
};

const makeInterceptors = () => {
  return {
    shouldLoseDurabilityOnGeneralDamage: new Interceptable<boolean>()
  };
};

export type PlayerArtifactInterceptor = ReturnType<typeof makeInterceptors>;

export type SerializedPlayerArtifact = {
  id: string;
  entityType: 'artifact';
  card: string;
  durability: number;
  maxDurability: number;
  modifiers: string[];
};

export class PlayerArtifact
  extends EntityWithModifiers<PlayerArtifactInterceptor>
  implements Serializable<SerializedPlayerArtifact>
{
  readonly card: ArtifactCard;

  private playerId: string;

  durability: number;

  private _isExhausted = false;

  constructor(game: Game, options: PlayerArtifactOptions) {
    super(`${options.playerId}-artifact-${nanoid(6)}`, game, makeInterceptors());
    this.card = options.card;
    this.durability = this.card.durability;
    this.playerId = options.playerId;
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'artifact' as const,
      card: this.card.id,
      durability: this.durability,
      maxDurability: this.maxDurability,
      modifiers: this.modifiers.list.map(modifier => modifier.id)
    };
  }

  get isExhausted() {
    return this._isExhausted;
  }

  exhaust() {
    this._isExhausted = true;
  }

  wakeUp() {
    this._isExhausted = false;
  }

  get maxDurability() {
    return this.card.durability;
  }

  get player() {
    return this.game.playerSystem.getPlayerById(this.playerId)!;
  }

  get shouldLoseDurabilityOnGeneralDamage(): boolean {
    return this.interceptors.shouldLoseDurabilityOnGeneralDamage.getValue(true, {});
  }

  async equip() {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_EQUIPED,
      new ArtifactEquipedEvent({
        artifact: this
      })
    );
  }

  async destroy() {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_DESTROY,
      new ArtifactDestroyEvent({
        artifact: this
      })
    );

    await this.player.artifactManager.unequip(this.card);
    await this.card.sendToDiscardPile();
    this.modifiers.list.forEach(async modifier => {
      await this.modifiers.remove(modifier.id);
    });

    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_DESTROY,
      new ArtifactDestroyEvent({ artifact: this })
    );
  }

  async loseDurability(amount = 1) {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE,
      new ArtifactBeforeDurabilityChangeEvent({ artifact: this })
    );
    const current = this.durability;
    this.durability -= amount;
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE,
      new ArtifactAfterDurabilityChangeEvent({
        artifact: this,
        oldDurability: current,
        newDurability: this.durability
      })
    );

    if (this.durability <= 0) {
      await this.destroy();
    }
  }

  async gainDurability(amount = 1) {
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE,
      new ArtifactBeforeDurabilityChangeEvent({
        artifact: this
      })
    );
    const current = this.durability;
    this.durability = Math.min(this.durability + amount, this.maxDurability);
    await this.game.emit(
      ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE,
      new ArtifactAfterDurabilityChangeEvent({
        artifact: this,
        oldDurability: current,
        newDurability: this.durability
      })
    );
  }
}
