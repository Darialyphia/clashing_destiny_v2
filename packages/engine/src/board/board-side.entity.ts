import {
  assert,
  isDefined,
  type EmptyObject,
  type Nullable,
  type Serializable
} from '@game/shared';
import { MinionCard, type SerializedMinionCard } from '../card/entities/minion.entity';
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
import {
  BoardMinionSlot,
  type SerializedBoardMinionSlot
} from './board-minion-slot.entity';
import type { Attacker } from '../game/phases/combat.phase';
import { match } from 'ts-pattern';
import { CARD_KINDS } from '../card/card.enums';

export type MinionSlot = number;

type MinionZone = {
  slots: Array<BoardMinionSlot>;
};

type SerializedCreatureZone = {
  slots: Array<SerializedBoardMinionSlot>;
};

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
  attackZone: SerializedCreatureZone;
  defenseZone: SerializedCreatureZone;
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
      slots: Array.from(
        { length: this.game.config.ATTACK_ZONE_SLOTS },
        (_, index) => new BoardMinionSlot(player, 'attack', index)
      )
    };
    this._defenseZone = {
      slots: Array.from(
        { length: this.game.config.DEFENSE_ZONE_SLOTS },
        (_, index) => new BoardMinionSlot(player, 'defense', index)
      )
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

  private getZone(zone: 'attack' | 'defense'): MinionZone {
    return zone === 'attack' ? this.attackZone : this.defenseZone;
  }

  getPositionFor(card: MinionCard) {
    const attackZoneIndex = this.attackZone.slots.findIndex(slot =>
      slot.minion?.equals(card)
    );
    if (attackZoneIndex >= 0) {
      return { zone: 'attack' as const, slot: attackZoneIndex as MinionSlot };
    }

    const defenseZoneIndex = this.defenseZone.slots.findIndex(slot =>
      slot.minion?.equals(card)
    );
    if (defenseZoneIndex >= 0) {
      return { zone: 'defense' as const, slot: defenseZoneIndex as MinionSlot };
    }

    return null;
  }

  getZoneFor(card: MinionCard) {
    const isInAttack = this.attackZone.slots.some(creature => creature?.equals(card));
    if (isInAttack) {
      return 'attack' as const;
    }

    const isInDefense = this.defenseZone.slots.some(creature => creature?.equals(card));
    if (isInDefense) {
      return 'defense' as const;
    }

    return null;
  }

  getMinionAt(zone: 'attack' | 'defense', slot: MinionSlot): Nullable<MinionCard> {
    return this.getZone(zone).slots[slot].minion;
  }

  getAllAttackTargets(): Attacker[] {
    return [
      ...this.attackZone.slots.map(slot => slot.minion).filter(isDefined),
      ...this.defenseZone.slots.map(slot => slot.minion).filter(isDefined),
      this.heroZone.hero
    ];
  }

  getAllCardsInPlay(): AnyCard[] {
    return [
      ...this.attackZone.slots.flatMap(slot => {
        if (!slot.minion) return slot.modifiers.list.map(modifier => modifier.source);
        return [
          ...slot.modifiers.list.map(modifier => modifier.source),
          slot.minion,
          ...slot.minion.modifiers.list.map(modifier => modifier.source)
        ];
      }),
      ...this.defenseZone.slots.flatMap(slot => {
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

  summonMinion(card: MinionCard, zone: 'attack' | 'defense', slot: MinionSlot) {
    assert(!this.isOccupied(zone, slot), new CreatureSlotAlreadyOccupiedError());

    this.getZone(zone).slots[slot].summon(card);
  }

  isOccupied(zone: 'attack' | 'defense', slot: MinionSlot): boolean {
    return this.getZone(zone).slots[slot].isOccupied;
  }

  get hasUnoccupiedSlot() {
    return (
      this.attackZone.slots.some(slot => !slot.isOccupied) ||
      this.defenseZone.slots.some(slot => !slot.isOccupied)
    );
  }

  getSlot(zone: 'attack' | 'defense', slot: number): BoardMinionSlot | null {
    return this.getZone(zone).slots[slot] ?? null;
  }

  getMinions(zone: 'attack' | 'defense'): MinionCard[] {
    return this.getZone(zone)
      .slots.map(slot => slot.minion)
      .filter(isDefined);
  }

  getAllMinions(): MinionCard[] {
    return [...this.attackZone.slots, ...this.defenseZone.slots]
      .map(slot => slot.minion)
      .filter(isDefined);
  }

  moveMinion(
    from: { zone: 'attack' | 'defense'; slot: MinionSlot },
    to: { zone: 'attack' | 'defense'; slot: MinionSlot },
    { allowSwap = false }: { allowSwap: boolean } = { allowSwap: false }
  ) {
    if (from.zone === to.zone && from.slot === to.slot) return;

    const fromSlot = this.getSlot(from.zone, from.slot);
    const toSlot = this.getSlot(to.zone, to.slot);
    assert(isDefined(fromSlot), 'Invalid from slot');
    assert(isDefined(toSlot), 'Invalid to slot');
    assert(fromSlot.isOccupied, 'No creature in slot');
    assert(allowSwap || !toSlot.isOccupied, 'Target slot occupied');

    const minion = fromSlot.removeMinion();
    if (toSlot.isOccupied && allowSwap) {
      const otherMinion = toSlot.removeMinion();
      toSlot.summon(minion);
      fromSlot.summon(otherMinion);
      return;
    }
    toSlot.summon(minion);
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
        this.attackZone.slots.forEach(slot => {
          if (slot.minion?.equals(card)) {
            slot.removeMinion();
          }
        });
        this.defenseZone.slots.forEach(slot => {
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
      attackZone: {
        slots: this.attackZone.slots.map(slot => slot.serialize())
      },
      defenseZone: {
        slots: this.defenseZone.slots.map(slot => slot.serialize())
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
