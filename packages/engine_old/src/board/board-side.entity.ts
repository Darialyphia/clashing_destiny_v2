import {
  assert,
  isDefined,
  type EmptyObject,
  type Nullable,
  type Serializable
} from '@game/shared';
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
import { BoardSlot, type SerializedBoardSlot } from './board-slot.entity';
import type { BoardPosition } from '../game/interactions/selecting-minion-slots.interaction';
import { BOARD_SLOT_ROWS, type BoardSlotRow } from './board.constants';
import { MinionMoveEvent } from '../card/events/minion.events';

export type MinionSlot = number;

type MinionZone = {
  player: Player;
  slots: Array<BoardSlot>;
  hasEmptySlot: boolean;
  minions: MinionCard[];
  get(slot: number): BoardSlot;
  has(position: BoardPosition): boolean;
};

export type SerializedCreatureZone = {
  slots: Array<SerializedBoardSlot>;
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
    talents: string[];
  };
  frontRow: SerializedCreatureZone;
  backRow: SerializedCreatureZone;
  hand: string[];
  mainDeck: { total: number; remaining: number };
  discardPile: string[];
  banishPile: string[];
};

export type SerializedBoard = {
  sides: [SerializedBoardSide, SerializedBoardSide];
};

export class BoardSide
  extends Entity<EmptyObject>
  implements Serializable<SerializedBoardSide>
{
  readonly player: Player;
  private _frontRow: MinionZone;
  private _backRow: MinionZone;

  constructor(
    private game: Game,
    player: Player
  ) {
    super(`board-side-${player.id}`, {});
    this.player = player;
    this._frontRow = {
      player,
      slots: Array.from(
        { length: this.game.config.MINION_ROW_SLOTS },
        (_, index) => new BoardSlot(game, player, BOARD_SLOT_ROWS.FRONT_ROW, index)
      ),
      get hasEmptySlot() {
        return this.slots.some(slot => !slot.isOccupied);
      },
      get minions() {
        return this.slots.map(slot => slot.minion).filter(isDefined);
      },
      has(position: BoardPosition) {
        return this.slots.some(slot => slot.isSame(position));
      },
      get(slot: MinionSlot): BoardSlot {
        return this.slots[slot];
      }
    };
    this._backRow = {
      player,
      slots: Array.from(
        { length: this.game.config.MINION_ROW_SLOTS },
        (_, index) => new BoardSlot(game, player, BOARD_SLOT_ROWS.BACK_ROW, index)
      ),
      get hasEmptySlot() {
        return this.slots.some(slot => !slot.isOccupied);
      },
      get minions() {
        return this.slots.map(slot => slot.minion).filter(isDefined);
      },
      has(position: BoardPosition) {
        return this.slots.some(slot => slot.isSame(position));
      },
      get(slot: MinionSlot): BoardSlot {
        return this.slots[slot];
      }
    };
  }

  get heroZone() {
    return {
      hero: this.player.hero,
      artifacts: this.player.artifactManager.artifacts,
      talents: this.player.levelManager.talents
    };
  }

  get frontRow(): MinionZone {
    return this._frontRow;
  }

  get backRow(): MinionZone {
    return this._backRow;
  }

  private getRow(row: BoardSlotRow): MinionZone {
    return row === BOARD_SLOT_ROWS.FRONT_ROW ? this.frontRow : this.backRow;
  }

  getPositionFor(card: MinionCard) {
    const frontRowIndex = this.frontRow.slots.findIndex(slot =>
      slot.minion?.equals(card)
    );
    if (frontRowIndex >= 0) {
      return {
        row: BOARD_SLOT_ROWS.FRONT_ROW,
        slot: frontRowIndex as MinionSlot
      };
    }

    const backRowIndex = this.backRow.slots.findIndex(slot => slot.minion?.equals(card));
    if (backRowIndex >= 0) {
      return { row: BOARD_SLOT_ROWS.BACK_ROW, slot: backRowIndex as MinionSlot };
    }

    return null;
  }

  getZoneFor(card: MinionCard) {
    const isInAttack = this.frontRow.slots.some(creature => creature?.equals(card));
    if (isInAttack) {
      return 'attack' as const;
    }

    const isInDefense = this.backRow.slots.some(creature => creature?.equals(card));
    if (isInDefense) {
      return 'defense' as const;
    }

    return null;
  }

  getMinionAt(row: BoardSlotRow, slot: MinionSlot): Nullable<MinionCard> {
    return this.getRow(row).slots[slot].minion;
  }

  getAllCardsInPlay(): AnyCard[] {
    return [
      ...this.frontRow.slots.flatMap(slot => {
        return [slot.minion].filter(isDefined);
      }),
      ...this.backRow.slots.flatMap(slot => {
        return [slot.minion].filter(isDefined);
      }),
      this.heroZone.hero,
      ...this.heroZone.artifacts.flatMap(artifact => {
        return [artifact];
      }),
      ...this.heroZone.talents.flatMap(talent => {
        return [talent];
      })
    ].filter(isDefined);
  }

  summonMinion(card: MinionCard, row: BoardSlotRow, slot: MinionSlot) {
    assert(!this.isOccupied(row, slot), new BoardSlotAlreadyOccupiedError());

    this.getRow(row).slots[slot].summonMinion(card);
  }

  isOccupied(row: BoardSlotRow, slot: MinionSlot): boolean {
    return this.getRow(row).slots[slot].isOccupied;
  }

  get hasUnoccupiedSlot() {
    return this.frontRow.hasEmptySlot || this.backRow.hasEmptySlot;
  }

  get unoccupiedSlots() {
    return [
      ...this.frontRow.slots.filter(slot => !slot.isOccupied),
      ...this.backRow.slots.filter(slot => !slot.isOccupied)
    ];
  }

  getSlot(row: BoardSlotRow, slot: number): BoardSlot | null {
    return this.getRow(row).slots[slot] ?? null;
  }

  getMinionsInRow(row: BoardSlotRow): MinionCard[] {
    return this.getRow(row)
      .slots.map(slot => slot.minion)
      .filter(isDefined);
  }

  getAllMinions(): MinionCard[] {
    return [...this.frontRow.slots, ...this.backRow.slots]
      .map(slot => slot.minion)
      .filter(isDefined);
  }

  async moveMinion(
    from: { row: BoardSlotRow; slot: MinionSlot },
    to: { row: BoardSlotRow; slot: MinionSlot },
    { allowSwap = false }: { allowSwap: boolean } = { allowSwap: false }
  ) {
    if (from.row === to.row && from.slot === to.slot) return;

    const fromSlot = this.getSlot(from.row, from.slot);
    const toSlot = this.getSlot(to.row, to.slot);
    assert(isDefined(fromSlot), 'Invalid from slot');
    assert(isDefined(toSlot), 'Invalid to slot');
    assert(fromSlot.isOccupied, 'No creature in slot');
    assert(allowSwap || !toSlot.isOccupied, 'Target slot occupied');

    await this.game.emit(
      GAME_EVENTS.MINION_BEFORE_MOVE,
      new MinionMoveEvent({
        card: fromSlot.minion!,
        from: fromSlot,
        to: toSlot
      })
    );

    const minion = fromSlot.removeMinion();
    if (toSlot.isOccupied && allowSwap) {
      await this.game.emit(
        GAME_EVENTS.MINION_BEFORE_MOVE,
        new MinionMoveEvent({
          card: toSlot.minion!,
          from: toSlot,
          to: fromSlot
        })
      );
      const otherMinion = toSlot.removeMinion();
      toSlot.summonMinion(minion);
      fromSlot.summonMinion(otherMinion);
      await this.game.emit(
        GAME_EVENTS.MINION_AFTER_MOVE,
        new MinionMoveEvent({
          card: minion,
          from: fromSlot,
          to: toSlot
        })
      );
      await this.game.emit(
        GAME_EVENTS.MINION_AFTER_MOVE,
        new MinionMoveEvent({
          card: otherMinion,
          from: toSlot,
          to: fromSlot
        })
      );
      return;
    }
    toSlot.summonMinion(minion);
    await this.game.emit(
      GAME_EVENTS.MINION_AFTER_MOVE,
      new MinionMoveEvent({
        card: minion,
        from: fromSlot,
        to: toSlot
      })
    );
  }

  remove(card: AnyCard) {
    match(card.kind)
      .with(
        CARD_KINDS.HERO,
        CARD_KINDS.SPELL,
        CARD_KINDS.ARTIFACT,
        CARD_KINDS.DESTINY,
        () => {}
      )
      .with(CARD_KINDS.MINION, () => {
        this.frontRow.slots.forEach(slot => {
          if (slot.minion?.equals(card)) {
            slot.removeMinion();
          }
        });
        this.backRow.slots.forEach(slot => {
          if (slot.minion?.equals(card)) {
            slot.removeMinion();
          }
        });
      })
      .exhaustive();
  }

  serialize(): SerializedBoardSide {
    return {
      playerId: this.player.id,
      heroZone: {
        hero: this.heroZone.hero.id,
        artifacts: this.heroZone.artifacts.map(artifact => artifact.id),
        talents: this.heroZone.talents.map(destiny => destiny.id)
      },
      frontRow: {
        slots: this.frontRow.slots.map(slot => slot.serialize())
      },
      backRow: {
        slots: this.backRow.slots.map(slot => slot.serialize())
      },
      banishPile: [...this.player.cardManager.banishPile].map(card => card.id),
      discardPile: [...this.player.cardManager.discardPile].map(card => card.id),
      hand: this.player.cardManager.hand.map(card => card.id),
      mainDeck: {
        total: this.player.cardManager.mainDeckSize,
        remaining: this.player.cardManager.remainingCardsInMainDeck
      }
    };
  }
}

export class BoardSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Board slot is already occupied');
  }
}
