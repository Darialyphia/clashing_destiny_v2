import { assert, isDefined, type EmptyObject, type Serializable } from '@game/shared';
import { MinionCard, type SerializedMinionCard } from '../card/entities/minion.entity';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero.entity';
import type { SerializedArtifactCard } from '../card/entities/artifact.entity';
import type { SerializedSpellCard } from '../card/entities/spell.entity';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import { Entity } from '../entity';
import { match } from 'ts-pattern';
import { CARD_KINDS } from '../card/card.enums';
import type { SerializedSigilCard, SigilCard } from '../card/entities/sigil.entity';

export type MinionSlot = number;

export type SerializedMainDeckCard =
  | SerializedMinionCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedSigilCard;

export type DestinyDeckCard = HeroCard;
export type SerializedDestinyDeckCard = SerializedHeroCard;

export type SerializedBoardSide = {
  playerId: string;
  heroZone: {
    hero: string;
    artifacts: string[];
  };
  minions: string[];
  sigils: string[];
  hand: string[];
  destinyZone: string[];
  mainDeck: { total: number; remaining: number };
  discardPile: string[];
  banishPile: string[];
  destinyDeck: string[];
};

export type SerializedBoard = {
  sides: [SerializedBoardSide, SerializedBoardSide];
};

export class BoardSide
  extends Entity<EmptyObject>
  implements Serializable<SerializedBoardSide>
{
  readonly player: Player;
  private _minions: MinionCard[] = [];
  private _sigils: SigilCard[] = [];

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
      artifacts: this.player.artifactManager.artifacts
    };
  }

  get minions() {
    return this._minions;
  }

  get sigils() {
    return this._sigils;
  }

  getAllCardsInPlay(): AnyCard[] {
    return [
      ...this.minions.flatMap(card => {
        return [
          card,
          ...card.modifiers.list.flatMap(modifier => Array.from(modifier.sources))
        ].filter(isDefined);
      }),
      ...this.sigils.flatMap(card => {
        return [
          card,
          ...card.modifiers.list.flatMap(modifier => Array.from(modifier.sources))
        ].filter(isDefined);
      }),
      this.heroZone.hero,
      ...this.heroZone.artifacts.flatMap(artifact => {
        return [
          artifact,
          ...artifact.modifiers.list.flatMap(modifier => Array.from(modifier.sources))
        ].filter(isDefined);
      }),
      ...this.heroZone.hero.modifiers.list.flatMap(modifier =>
        Array.from(modifier.sources)
      )
    ].filter(isDefined);
  }

  summonMinion(card: MinionCard) {
    this.minions.push(card);
  }

  summonSigil(card: SigilCard) {
    this.sigils.push(card);
  }

  remove(card: AnyCard) {
    match(card.kind)
      .with(CARD_KINDS.HERO, CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () => {})
      .with(CARD_KINDS.MINION, CARD_KINDS.SIGIL, () => {
        this._minions = this.minions.filter(c => !c.equals(card));
        this._sigils = this.sigils.filter(c => !c.equals(card));
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
      minions: this.minions.map(card => card.id),
      sigils: this.sigils.map(card => card.id),
      banishPile: [...this.player.cardManager.banishPile].map(card => card.id),
      discardPile: [...this.player.cardManager.discardPile].map(card => card.id),
      hand: this.player.cardManager.hand.map(card => card.id),
      destinyZone: [...this.player.cardManager.destinyZone].map(card => card.id),
      mainDeck: {
        total: this.player.cardManager.mainDeckSize,
        remaining: this.player.cardManager.remainingCardsInMainDeck
      },
      destinyDeck: this.player.cardManager.destinyDeck.cards.map(card => card.id)
    };
  }
}

export class BoardSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Board slot is already occupied');
  }
}
