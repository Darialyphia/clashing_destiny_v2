import { isDefined, type EmptyObject, type Serializable } from '@game/shared';
import { MinionCard, type SerializedMinionCard } from '../card/entities/minion.entity';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero.entity';
import type {
  ArtifactCard,
  SerializedArtifactCard
} from '../card/entities/artifact.entity';
import type { SerializedSpellCard } from '../card/entities/spell.entity';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import { Entity } from '../entity';
import { match } from 'ts-pattern';
import { CARD_KINDS, CARD_LOCATIONS, type CardLocation } from '../card/card.enums';
import { LockedModifier } from '../modifier/modifiers/locked.modifier';
import { GAME_EVENTS } from '../game/game.events';
import { MinionMoveEvent } from '../card/events/minion.events';

export type MinionSlot = number;

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
  };
  hand: string[];
  runeZone: Array<{
    cardId: string;
    isRevealed: boolean;
  }>;
  mainDeck: { total: number; remaining: number };
  discardPile: string[];
  banishPile: string[];
  runeDeck: string[];
  base: {
    minions: string[];
    artifacts: string[];
  };
  battlefield: {
    minions: string[];
  };
};

export type SerializedBoard = {
  sides: [SerializedBoardSide, SerializedBoardSide];
};

export type BoardBase = {
  minions: MinionCard[];
  artifacts: AnyCard[];
};

export type BoardBattlefield = {
  minions: MinionCard[];
  hero: HeroCard | null;
};
export class BoardSide
  extends Entity<EmptyObject>
  implements Serializable<SerializedBoardSide>
{
  private readonly player: Player;

  private readonly _base: BoardBase = {
    minions: [],
    artifacts: []
  };

  readonly _battlefield: BoardBattlefield = {
    minions: [],
    hero: null as HeroCard | null
  };

  constructor(
    private game: Game,
    player: Player
  ) {
    super(`board-side-${player.id}`, {});
    this.player = player;
  }

  get heroZone() {
    return {
      hero: this.player.hero
    };
  }

  get base() {
    return this._base;
  }

  get battlefield() {
    return this._battlefield;
  }

  getAllCardsInPlay(): AnyCard[] {
    return [
      ...this.base.minions.flatMap(card => {
        return [
          card,
          ...card.modifiers.list.flatMap(modifier => Array.from(modifier.sources))
        ].filter(isDefined);
      }),
      ...this.battlefield.minions.flatMap(card => {
        return [
          card,
          ...card.modifiers.list.flatMap(modifier => Array.from(modifier.sources))
        ].filter(isDefined);
      }),
      this.heroZone.hero,
      ...this.base.artifacts.flatMap(artifact => {
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

  summonMinion(
    card: MinionCard,
    location: Extract<CardLocation, 'base' | 'battlefield'>
  ) {
    if (location === CARD_LOCATIONS.BASE) {
      this._base.minions.push(card);
    } else if (location === CARD_LOCATIONS.BATTLEFIELD) {
      this._battlefield.minions.push(card);
    }
  }

  summonHero(card: HeroCard) {
    this._battlefield.hero = card;
  }

  equipArtifact(card: ArtifactCard) {
    this._base.artifacts.push(card);
  }

  remove(card: AnyCard) {
    match(card.kind)
      .with(CARD_KINDS.HERO, CARD_KINDS.SPELL, () => {})
      .with(CARD_KINDS.ARTIFACT, () => {
        this._base.artifacts = this._base.artifacts.filter(c => c.id !== card.id);
      })
      .with(CARD_KINDS.MINION, () => {
        this._base.minions = this._base.minions.filter(c => c.id !== card.id);
        this._battlefield.minions = this._battlefield.minions.filter(
          c => c.id !== card.id
        );
      })
      .with(CARD_KINDS.RUNE, () => {
        card.removeFromCurrentLocation();
      })
      .exhaustive();
  }

  getCardInBase(cardId: string) {
    return this.base.minions.find(c => c.id === cardId);
  }

  getCardInBattlefield(cardId: string) {
    return this.battlefield.minions.find(c => c.id === cardId);
  }

  isInBase(cardId: string) {
    return this.base.minions.some(c => c.id === cardId);
  }

  isInBattlefield(cardId: string) {
    return this.battlefield.minions.some(c => c.id === cardId);
  }

  async moveMinion(id: string, index: number) {
    const minionInBase = this.getCardInBase(id);
    if (minionInBase) {
      await this.game.emit(
        GAME_EVENTS.MINION_BEFORE_MOVE,
        new MinionMoveEvent({
          card: minionInBase,
          from: CARD_LOCATIONS.BASE,
          to: CARD_LOCATIONS.BATTLEFIELD
        })
      );
      this._base.minions = this._base.minions.filter(c => c.id !== id);
      this._battlefield.minions.splice(index, 0, minionInBase);
      await this.game.emit(
        GAME_EVENTS.MINION_BEFORE_MOVE,
        new MinionMoveEvent({
          card: minionInBase,
          from: CARD_LOCATIONS.BASE,
          to: CARD_LOCATIONS.BATTLEFIELD
        })
      );
      return;
    }

    const minionInBattlefield = this.getCardInBattlefield(id);
    if (minionInBattlefield) {
      await this.game.emit(
        GAME_EVENTS.MINION_BEFORE_MOVE,
        new MinionMoveEvent({
          card: minionInBattlefield,
          from: CARD_LOCATIONS.BATTLEFIELD,
          to: CARD_LOCATIONS.BASE
        })
      );
      this._battlefield.minions = this._battlefield.minions.filter(c => c.id !== id);
      this._base.minions.splice(index, 0, minionInBattlefield);
      await this.game.emit(
        GAME_EVENTS.MINION_AFTER_MOVE,
        new MinionMoveEvent({
          card: minionInBattlefield,
          from: CARD_LOCATIONS.BATTLEFIELD,
          to: CARD_LOCATIONS.BASE
        })
      );
      return;
    }
  }

  serialize(): SerializedBoardSide {
    return {
      playerId: this.player.id,
      heroZone: {
        hero: this.heroZone.hero.id
      },
      banishPile: [...this.player.cardManager.banishPile].map(card => card.id),
      discardPile: [...this.player.cardManager.discardPile].map(card => card.id),
      hand: this.player.cardManager.hand.map(card => card.id),
      runeZone: [...this.player.cardManager.runeZone].map(card => ({
        cardId: card.id,
        isRevealed: card.isRevealed
      })),
      mainDeck: {
        total: this.player.cardManager.mainDeckSize,
        remaining: this.player.cardManager.remainingCardsInMainDeck
      },
      runeDeck: this.player.cardManager.runeDeck.cards.map(card => card.id),
      base: {
        minions: this.base.minions.map(card => card.id),
        artifacts: this.base.artifacts.map(card => card.id)
      },
      battlefield: {
        minions: this.battlefield.minions.map(card => card.id)
      }
    };
  }
}

export class BoardSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Board slot is already occupied');
  }
}
