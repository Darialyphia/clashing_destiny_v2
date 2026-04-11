import type { EmptyObject } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { ARTIFACT_EVENTS } from './player.enums';
import type { PlayerArtifact } from './player-artifact.entity';

export class ArtifactEquipedEvent extends TypedSerializableEvent<
  { artifact: PlayerArtifact },
  { artifact: string }
> {
  serialize() {
    return {
      artifact: this.data.artifact.id
    };
  }
}

export class ArtifactBeforeDurabilityChangeEvent extends TypedSerializableEvent<
  { artifact: PlayerArtifact },
  { artifact: string }
> {
  serialize() {
    return {
      artifact: this.data.artifact.id
    };
  }
}

export class ArtifactAfterDurabilityChangeEvent extends TypedSerializableEvent<
  { artifact: PlayerArtifact; oldDurability: number; newDurability: number },
  { artifact: string; oldDurability: number; newDurability: number }
> {
  serialize() {
    return {
      artifact: this.data.artifact.id,
      oldDurability: this.data.oldDurability,
      newDurability: this.data.newDurability
    };
  }
}

export class ArtifactDestroyEvent extends TypedSerializableEvent<
  { artifact: PlayerArtifact },
  { artifact: string }
> {
  serialize() {
    return {
      artifact: this.data.artifact.id
    };
  }
}

export type ArtifactEventMap = {
  [ARTIFACT_EVENTS.ARTIFACT_EQUIPED]: ArtifactEquipedEvent;
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE]: ArtifactBeforeDurabilityChangeEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE]: ArtifactAfterDurabilityChangeEvent;
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_DESTROY]: ArtifactDestroyEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_DESTROY]: ArtifactDestroyEvent;
};
