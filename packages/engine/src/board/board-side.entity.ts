import {
  assert,
  isDefined,
  type EmptyObject,
  type Nullable,
  type Serializable
} from '@game/shared';
import {
  MinionCard,
  MinionMoveEvent,
  type SerializedMinionCard
} from '../card/entities/minion.entity';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero.entity';
import type { SerializedArtifactCard } from '../card/entities/artifact.entity';
import type { SerializedSpellCard } from '../card/entities/spell.entity';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import { Entity } from '../entity';
import {
  BoardMinionSlot,
  type SerializedBoardMinionSlot
} from './board-minion-slot.entity';
import { match } from 'ts-pattern';
import { CARD_KINDS } from '../card/card.enums';
import type { MinionPosition } from '../game/interactions/selecting-minion-slots.interaction';
import { GAME_EVENTS } from '../game/game.events';
import { MINION_SLOT_ZONES, type MinionSlotZone } from './board;constants';

export type MinionSlot = number;

type MinionZone = {
  player: Player;
  slots: Array<BoardMinionSlot>;
  hasEmptySlot: boolean;
  minions: MinionCard[];
  get(slot: number): BoardMinionSlot;
  has(position: MinionPosition): boolean;
};

type SerializedCreatureZone = {
  slots: Array<SerializedBoardMinionSlot>;
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
  frontRow: SerializedCreatureZone;
  backRow: SerializedCreatureZone;
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
        { length: this.game.config.ATTACK_ZONE_SLOTS },
        (_, index) => new BoardMinionSlot(player, MINION_SLOT_ZONES.FRONT_ROW, index)
      ),
      get hasEmptySlot() {
        return this.slots.some(slot => !slot.isOccupied);
      },
      get minions() {
        return this.slots.map(slot => slot.minion).filter(isDefined);
      },
      has(position: MinionPosition) {
        return this.slots.some(slot => slot.isSame(position));
      },
      get(slot: MinionSlot): BoardMinionSlot {
        return this.slots[slot];
      }
    };
    this._backRow = {
      player,
      slots: Array.from(
        { length: this.game.config.DEFENSE_ZONE_SLOTS },
        (_, index) => new BoardMinionSlot(player, MINION_SLOT_ZONES.BACK_ROW, index)
      ),
      get hasEmptySlot() {
        return this.slots.some(slot => !slot.isOccupied);
      },
      get minions() {
        return this.slots.map(slot => slot.minion).filter(isDefined);
      },
      has(position: MinionPosition) {
        return this.slots.some(slot => slot.isSame(position));
      },
      get(slot: MinionSlot): BoardMinionSlot {
        return this.slots[slot];
      }
    };
  }

  get heroZone() {
    return {
      hero: this.player.hero,
      artifacts: this.player.artifactManager.artifacts
    };
  }

  get frontRow(): MinionZone {
    return this._frontRow;
  }

  get backRow(): MinionZone {
    return this._backRow;
  }

  private getZone(zone: MinionSlotZone): MinionZone {
    return zone === MINION_SLOT_ZONES.FRONT_ROW ? this.frontRow : this.backRow;
  }

  getPositionFor(card: MinionCard) {
    const frontRowIndex = this.frontRow.slots.findIndex(slot =>
      slot.minion?.equals(card)
    );
    if (frontRowIndex >= 0) {
      return {
        zone: MINION_SLOT_ZONES.FRONT_ROW,
        slot: frontRowIndex as MinionSlot
      };
    }

    const backRowIndex = this.backRow.slots.findIndex(slot => slot.minion?.equals(card));
    if (backRowIndex >= 0) {
      return { zone: MINION_SLOT_ZONES.BACK_ROW, slot: backRowIndex as MinionSlot };
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

  getMinionAt(zone: MinionSlotZone, slot: MinionSlot): Nullable<MinionCard> {
    return this.getZone(zone).slots[slot].minion;
  }

  getAllCardsInPlay(): AnyCard[] {
    return [
      ...this.frontRow.slots.flatMap(slot => {
        if (!slot.minion) return slot.modifiers.list.map(modifier => modifier.source);
        return [
          ...slot.modifiers.list.map(modifier => modifier.source),
          slot.minion,
          ...slot.minion.modifiers.list.map(modifier => modifier.source)
        ];
      }),
      ...this.backRow.slots.flatMap(slot => {
        if (!slot.minion) return slot.modifiers.list.map(modifier => modifier.source);
        return [
          ...slot.modifiers.list.map(modifier => modifier.source),
          slot.minion,
          ...slot.minion.modifiers.list.map(modifier => modifier.source)
        ];
      }),
      this.heroZone.hero,
      ...this.heroZone.artifacts.flatMap(artifact => {
        return [artifact, ...artifact.modifiers.list.map(modifier => modifier.source)];
      }),
      ...this.heroZone.hero.modifiers.list.flatMap(modifier => modifier.source)
    ].filter(isDefined);
  }

  summonMinion(card: MinionCard, zone: MinionSlotZone, slot: MinionSlot) {
    assert(!this.isOccupied(zone, slot), new CreatureSlotAlreadyOccupiedError());

    this.getZone(zone).slots[slot].summon(card);
  }

  isOccupied(zone: MinionSlotZone, slot: MinionSlot): boolean {
    return this.getZone(zone).slots[slot].isOccupied;
  }

  get hasUnoccupiedSlot() {
    return (
      this.frontRow.slots.some(slot => !slot.isOccupied) ||
      this.backRow.slots.some(slot => !slot.isOccupied)
    );
  }

  get unoccupiedSlots() {
    return [
      ...this.frontRow.slots
        .filter(slot => !slot.isOccupied)
        .map(slot => ({ zone: 'attack' as const, slot: slot })),
      ...this.backRow.slots
        .filter(slot => !slot.isOccupied)
        .map(slot => ({ zone: 'defense' as const, slot: slot }))
    ];
  }

  getSlot(zone: MinionSlotZone, slot: number): BoardMinionSlot | null {
    return this.getZone(zone).slots[slot] ?? null;
  }

  getMinions(zone: MinionSlotZone): MinionCard[] {
    return this.getZone(zone)
      .slots.map(slot => slot.minion)
      .filter(isDefined);
  }

  getAllMinions(): MinionCard[] {
    return [...this.frontRow.slots, ...this.backRow.slots]
      .map(slot => slot.minion)
      .filter(isDefined);
  }

  async moveMinion(
    from: { zone: MinionSlotZone; slot: MinionSlot },
    to: { zone: MinionSlotZone; slot: MinionSlot },
    { allowSwap = false }: { allowSwap: boolean } = { allowSwap: false }
  ) {
    if (from.zone === to.zone && from.slot === to.slot) return;

    const fromSlot = this.getSlot(from.zone, from.slot);
    const toSlot = this.getSlot(to.zone, to.slot);
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
      toSlot.summon(minion);
      fromSlot.summon(otherMinion);
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
    toSlot.summon(minion);
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
      .with(CARD_KINDS.HERO, CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, () => {})
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
        artifacts: this.heroZone.artifacts.map(artifact => artifact.id)
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
      destinyZone: [...this.player.cardManager.destinyZone].map(card => card.id),
      mainDeck: {
        total: this.player.cardManager.mainDeckSize,
        remaining: this.player.cardManager.remainingCardsInMainDeck
      },
      destinyDeck: this.player.cardManager.destinyDeck.cards.map(card => card.id)
    };
  }
}

export class CreatureSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Creature slot is already occupied');
  }
}
