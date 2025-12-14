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
import { GAME_EVENTS } from '../game/game.events';
import { BOARD_SLOT_ZONES, type BoardSlotZone } from './board.constants';
import type { SigilCard } from '../card/entities/sigil.entity';
import { isMinion, isSigil } from '../card/card-utils';
import { CardChangeZoneEvent } from '../card/card.events';

export type MinionSlot = number;

type MinionZone = {
  player: Player;
  cards: Array<MinionCard | SigilCard>;
  minions: MinionCard[];
  sigils: SigilCard[];
};

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
  attackZone: string[];
  defenseZone: string[];
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
  private _attackZone: MinionZone;
  private _defenseZone: MinionZone;

  constructor(
    private game: Game,
    player: Player
  ) {
    super(`board-side-${player.id}`, {});
    this.player = player;
    this._attackZone = {
      player,
      cards: [],
      get minions() {
        return this.cards.filter(isMinion);
      },
      get sigils() {
        return this.cards.filter(isSigil);
      }
    };
    this._defenseZone = {
      player,
      cards: [],
      get minions() {
        return this.cards.filter(isMinion);
      },
      get sigils() {
        return this.cards.filter(isSigil);
      }
    };
  }

  get heroZone() {
    return {
      hero: this.player.hero,
      artifacts: this.player.artifactManager.artifacts
    };
  }

  get attackZone(): MinionZone {
    return this._attackZone;
  }

  get defenseZone(): MinionZone {
    return this._defenseZone;
  }

  private getZone(zone: BoardSlotZone): MinionZone {
    return zone === BOARD_SLOT_ZONES.ATTACK_ZONE ? this.attackZone : this.defenseZone;
  }

  getZoneFor(card: MinionCard | SigilCard) {
    const attackZoneIndex = this.attackZone.cards.findIndex(slot => slot.equals(card));
    if (attackZoneIndex >= 0) {
      return BOARD_SLOT_ZONES.ATTACK_ZONE;
    }

    const defenseZoneIndex = this.defenseZone.cards.findIndex(slot => slot.equals(card));
    if (defenseZoneIndex >= 0) {
      return BOARD_SLOT_ZONES.DEFENSE_ZONE;
    }

    return null;
  }

  getAllCardsInPlay(): AnyCard[] {
    return [
      ...this.attackZone.cards.flatMap(card => {
        return [card, ...card.modifiers.list.map(modifier => modifier.source)].filter(
          isDefined
        );
      }),
      ...this.defenseZone.cards.flatMap(card => {
        return [card, ...card.modifiers.list.map(modifier => modifier.source)];
      }),
      this.heroZone.hero,
      ...this.heroZone.artifacts.flatMap(artifact => {
        return [artifact, ...artifact.modifiers.list.map(modifier => modifier.source)];
      }),
      ...this.heroZone.hero.modifiers.list.flatMap(modifier => modifier.source)
    ].filter(isDefined);
  }

  summonMinion(card: MinionCard, zone: BoardSlotZone) {
    this.getZone(zone).cards.push(card);
  }

  summonSigil(card: SigilCard, zone: BoardSlotZone) {
    this.getZone(zone).cards.push(card);
  }

  getMinions(zone: BoardSlotZone): MinionCard[] {
    return this.getZone(zone).minions;
  }

  getAllMinions(): MinionCard[] {
    return [...this.attackZone.minions, ...this.defenseZone.minions];
  }

  async move(card: MinionCard | SigilCard) {
    const zone = this.getZoneFor(card);
    const destination =
      zone === BOARD_SLOT_ZONES.ATTACK_ZONE
        ? BOARD_SLOT_ZONES.DEFENSE_ZONE
        : BOARD_SLOT_ZONES.ATTACK_ZONE;
    assert(isDefined(zone), 'Card is not on board');

    await this.game.emit(
      GAME_EVENTS.CARD_AFTER_CHANGE_ZONE,
      new CardChangeZoneEvent({
        card,
        from: zone,
        to: destination
      })
    );

    const fromZone = this.getZone(zone);
    const toZone = this.getZone(destination);
    const fromIndex = fromZone.cards.findIndex(c => c.equals(card));
    assert(fromIndex >= 0, 'Card not found in the expected zone');
    fromZone.cards.splice(fromIndex, 1);
    toZone.cards.push(card);

    await this.game.emit(
      GAME_EVENTS.CARD_AFTER_CHANGE_ZONE,
      new CardChangeZoneEvent({
        card,
        from: zone,
        to: destination
      })
    );
  }

  remove(card: AnyCard) {
    match(card.kind)
      .with(CARD_KINDS.HERO, CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () => {})
      .with(CARD_KINDS.MINION, CARD_KINDS.SIGIL, () => {
        this.attackZone.cards = this.attackZone.cards.filter(c => !c.equals(card));
        this.defenseZone.cards = this.defenseZone.cards.filter(c => !c.equals(card));
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
      attackZone: this.attackZone.cards.map(card => card.id),
      defenseZone: this.defenseZone.cards.map(card => card.id),
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
