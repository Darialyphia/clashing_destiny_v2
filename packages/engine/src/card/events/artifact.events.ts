import type { Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { ArtifactCard, SerializedArtifactCard } from '../entities/artifact.entity';
import type { BoardSpace, SerializedBoardSpace } from '../../board/board-space.entity';

export const ARTIFACT_EVENTS = {
  ARTIFACT_BEFORE_LOSE_DURABILITY: 'artifact.lose-durability',
  ARTIFACT_AFTER_LOSE_DURABILITY: 'artifact.after-lose-durability',
  ARTIFACT_BEFORE_GAIN_DURABILITY: 'artifact.gain-durability',
  ARTIFACT_AFTER_GAIN_DURABILITY: 'artifact.after-gain-durability',
  ARTIFACT_EQUIPED: 'artifact.equiped'
} as const;

export type ArtifactEvents = Values<typeof ARTIFACT_EVENTS>;

export class ArtifactDurabilityEvent extends TypedSerializableEvent<
  { card: ArtifactCard; amount: number },
  { card: SerializedArtifactCard; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      amount: this.data.amount
    };
  }
}

export class ArtifactEquipedEvent extends TypedSerializableEvent<
  { card: ArtifactCard; position: BoardSpace<ArtifactCard> },
  { card: SerializedArtifactCard; position: SerializedBoardSpace }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      position: this.data.position.serialize()
    };
  }
}

export type ArtifactCardEventMap = {
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_LOSE_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_LOSE_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_BEFORE_GAIN_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_AFTER_GAIN_DURABILITY]: ArtifactDurabilityEvent;
  [ARTIFACT_EVENTS.ARTIFACT_EQUIPED]: ArtifactEquipedEvent;
};
