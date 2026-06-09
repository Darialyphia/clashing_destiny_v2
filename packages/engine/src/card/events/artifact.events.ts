import type { Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { SerializedArtifactCard, Artifact } from '../entities/artifact.entity';

export const ARTIFACT_EVENTS = {
  ARTIFACT_EQUIPED: 'artifact.equipped',
  ARTIFACT_BEFORE_DURABILITY_CHANGE: 'artifact.before-durability-change',
  ARTIFACT_AFTER_DURABILITY_CHANGE: 'artifact.after-durability-change'
} as const;
export type ArtifactEvents = Values<typeof ARTIFACT_EVENTS>;

export class ArtifactDurabilityChangeEvent extends TypedSerializableEvent<
  { card: Artifact; amount: number },
  { card: string; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.id,
      amount: this.data.amount
    };
  }
}

export class ArtifactEquippedEvent extends TypedSerializableEvent<
  { card: Artifact },
  { card: string }
> {
  serialize() {
    return {
      card: this.data.card.id
    };
  }
}

export type ArtifactCardEventMap = {
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_DURABILITY_CHANGE]: ArtifactDurabilityChangeEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_DURABILITY_CHANGE]: ArtifactDurabilityChangeEvent;
  [ARTIFACT_EVENTS.ARTIFACT_EQUIPED]: ArtifactEquippedEvent;
};
