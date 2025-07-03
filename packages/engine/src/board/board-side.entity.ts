import { assert, isDefined, type EmptyObject, type Serializable } from '@game/shared';
import { MinionCard, type SerializedMinionCard } from '../card/entities/minion.card';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero.entity';
import type {
  ArtifactCard,
  SerializedArtifactCard
} from '../card/entities/artifact.entity';
import type { SerializedSpellCard, SpellCard } from '../card/entities/spell.entity';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import { Entity } from '../entity';
import { match } from 'ts-pattern';
import { CARD_KINDS } from '../card/card.enums';

export type MinionSlot = number;
export type MainDeckCard = MinionCard | SpellCard | ArtifactCard;

export type SerializedMainDeckCard =
  | SerializedMinionCard
  | SerializedSpellCard
  | SerializedArtifactCard;

export type DestinyDeckCard = HeroCard;
export type SerializedDestinyDeckCard = SerializedHeroCard;

export type SerializedBoardSide = {
  playerId: string;
  heroZone: {
    hero: string;
    artifacts: string[];
  };
  minionZone: string[];
  hand: string[];
  resourceZone: string[];
  deck: { total: number; remaining: number };
  discardPile: string[];
};

export type SerializedBoard = {
  sides: [SerializedBoardSide, SerializedBoardSide];
};

export class BoardSide
  extends Entity<EmptyObject>
  implements Serializable<SerializedBoardSide>
{
  readonly player: Player;
  private _minionZone: MinionCard[] = [];

  constructor(
    private game: Game,
    player: Player
  ) {
    super(`board-side-${player.id}`, {});
    this.player = player;
  }

  get heroZone() {
    return {
      hero: this.player.hero,
      artifacts: [
        this.player.artifactManager.artifacts.weapon,
        this.player.artifactManager.artifacts.armor,
        this.player.artifactManager.artifacts.relic
      ].filter(isDefined)
    };
  }

  get minionZone() {
    return this._minionZone;
  }

  getAllCardsInPlay(): AnyCard[] {
    return [
      ...this.minionZone.flatMap(minion => [
        minion,
        ...minion.modifiers.list.map(modifier => modifier.source)
      ]),
      this.heroZone.hero,
      ...this.heroZone.artifacts.flatMap(artifact => {
        return [artifact, ...artifact.modifiers.list.map(modifier => modifier.source)];
      }),
      ...this.heroZone.hero.modifiers.list.flatMap(modifier => modifier.source)
    ].filter(isDefined);
  }

  summonMinion(card: MinionCard, index: number) {
    this._minionZone.splice(index, 0, card);
  }

  moveMinion(from: number, to: number) {
    assert(from >= 0 && from < this._minionZone.length, `Invalid source index: ${from}`);
    assert(to >= 0 && to < this._minionZone.length, `Invalid destination index: ${to}`);
    const [minion] = this._minionZone.splice(from, 1);
    this._minionZone.splice(to, 0, minion);
  }

  remove(card: AnyCard) {
    match(card.kind)
      .with(CARD_KINDS.HERO, CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () => {})
      .with(CARD_KINDS.MINION, () => {
        const index = this._minionZone.findIndex(minion => minion.id === card.id);
        if (index !== -1) {
          this._minionZone.splice(index, 1);
        }
      })
      .exhaustive();
  }

  serialize(): SerializedBoardSide {
    return {
      playerId: this.player.id,
      heroZone: {
        hero: this.heroZone.hero.id,
        artifacts: this.heroZone.artifacts.map(artifact => artifact.id)
      },
      minionZone: this.minionZone.map(minion => minion.id),
      discardPile: [...this.player.cardManager.discardPile].map(card => card.id),
      hand: this.player.cardManager.hand.map(card => card.id),
      resourceZone: [...this.player.cardManager.destinyZone].map(card => card.id),
      deck: {
        total: this.player.cardManager.mainDeckSize,
        remaining: this.player.cardManager.remainingCardsInMainDeck
      }
    };
  }
}

export class CreatureSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Creature slot is already occupied');
  }
}
