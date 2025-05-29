import { type Serializable } from '@game/shared';
import { MinionCard, type SerializedMinionCard } from '../card/entities/minion.card';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero.entity';
import type {
  ArtifactCard,
  SerializedArtifactCard
} from '../card/entities/artifact.entity';
import type { SerializedSpellCard, SpellCard } from '../card/entities/spell.entity';
import type { AttackCard, SerializedAttackCard } from '../card/entities/attck.entity';
import type {
  LocationCard,
  SerializedLocationCard
} from '../card/entities/location.entity';
import type { SerializedTalentCard, TalentCard } from '../card/entities/talent.entity';
import type { AnyCard } from '../card/entities/card.entity';
import { System } from '../system';
import type { BoardSide, SerializedBoardSide } from './board-side.entity';

export type MinionSlot = number;

type SerializedCreatureZone = {
  slots: (SerializedMinionCard | null)[];
};

export type MainDeckCard =
  | MinionCard
  | SpellCard
  | ArtifactCard
  | AttackCard
  | LocationCard;

export type SerializedMainDeckCard =
  | SerializedMinionCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedAttackCard
  | SerializedLocationCard;

export type DestinyDeckCard = HeroCard | TalentCard;
export type SerializedDestinyDeckCard = SerializedHeroCard | SerializedTalentCard;

export type SerializedBoard = {
  sides: [SerializedBoardSide, SerializedBoardSide];
};

export class BoardSystem extends System<never> implements Serializable<SerializedBoard> {
  initialize() {}
  shutdown() {}

  get sides(): [BoardSide, BoardSide] {
    return [
      this.game.playerSystem.player1.boardSide,
      this.game.playerSystem.player2.boardSide
    ];
  }
  getAllCardsInPlay(): AnyCard[] {
    return this.sides.flatMap(side => side.getAllCardsInPlay());
  }

  serialize(): SerializedBoard {
    return {
      sides: this.sides.map(side => side.serialize()) as unknown as [
        SerializedBoardSide,
        SerializedBoardSide
      ]
    };
  }
}

export class CreatureSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Creature slot is already occupied');
  }
}

export class ShardZoneAlreadyOccupiedError extends Error {
  constructor() {
    super('Shard zone is already occupied');
  }
}
