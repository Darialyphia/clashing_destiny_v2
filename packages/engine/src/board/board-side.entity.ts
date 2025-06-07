import {
  assert,
  isDefined,
  type EmptyObject,
  type Nullable,
  type Serializable
} from '@game/shared';
import { MinionCard, type SerializedMinionCard } from '../card/entities/minion.card';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero.entity';
import type {
  ArtifactCard,
  SerializedArtifactCard
} from '../card/entities/artifact.entity';
import type { SerializedSpellCard, SpellCard } from '../card/entities/spell.entity';
import type { AttackCard, SerializedAttackCard } from '../card/entities/attack.entity';
import type {
  LocationCard,
  SerializedLocationCard
} from '../card/entities/location.entity';
import type { SerializedTalentCard, TalentCard } from '../card/entities/talent.entity';
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

export type SerializedBoardSide = {
  playerId: string;
  heroZone: {
    hero: string;
    artifacts: string[];
  };
  attackZone: SerializedCreatureZone;
  defenseZone: SerializedCreatureZone;
  location: SerializedLocationCard | null;
  hand: string[];
  destinyZone: string[];
  mainDeck: { total: number; remaining: number };
  destinyDeck: { total: number; remaining: number };
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
  private _attackZone: MinionZone;
  private _defenseZone: MinionZone;
  private location: LocationCard | null = null;

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
      artifacts: [
        this.player.artifactManager.artifacts.weapon,
        this.player.artifactManager.artifacts.armor,
        this.player.artifactManager.artifacts.relic
      ].filter(isDefined)
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
    const attackZoneIndex = this.attackZone.slots.findIndex(creature =>
      creature?.equals(card)
    );
    if (attackZoneIndex >= 0) {
      return { zone: 'attack' as const, slot: attackZoneIndex as MinionSlot };
    }

    const defenseZoneIndex = this.defenseZone.slots.findIndex(creature =>
      creature?.equals(card)
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
      ...this.heroZone.artifacts.flatMap(artifact => {
        return [artifact, ...artifact.modifiers.list.map(modifier => modifier.source)];
      }),
      ...this.heroZone.hero.modifiers.list.flatMap(modifier => modifier.source),
      this.location
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
    to: { zone: 'attack' | 'defense'; slot: MinionSlot }
  ) {
    if (from.zone === to.zone && from.slot === to.slot) return;

    const fromSlot = this.getSlot(from.zone, from.slot);
    const toSlot = this.getSlot(to.zone, to.slot);
    assert(isDefined(fromSlot), 'Invalid from slot');
    assert(isDefined(toSlot), 'Invalid to slot');
    assert(fromSlot.isOccupied, 'No creature in slot');
    assert(!toSlot.isOccupied, 'Target slot occupied');

    const minion = fromSlot.removeMinion();
    toSlot.summon(minion);
  }

  async changeLocation(location: LocationCard) {
    await this.removeLocation();
    this.location = location;
  }

  removeLocation() {
    if (this.location) {
      this.location = null;
    }
  }

  remove(card: AnyCard) {
    match(card.kind)
      .with(
        CARD_KINDS.HERO,
        CARD_KINDS.TALENT,
        CARD_KINDS.SPELL,
        CARD_KINDS.ATTACK,
        CARD_KINDS.ARTIFACT,
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
      .with(CARD_KINDS.LOCATION, () => {
        this.removeLocation();
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
      location: this.location ? this.location.serialize() : null,
      destinyZone: [...this.player.cardManager.destinyZone].map(card => card.id),
      mainDeck: {
        total: this.player.cardManager.mainDeckSize,
        remaining: this.player.cardManager.remainingCardsInMainDeck
      },
      destinyDeck: {
        total: this.player.cardManager.destinyDeckSize,
        remaining: this.player.cardManager.remainingCardsInDestinyDeck
      }
    };
  }
}

export class CreatureSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Creature slot is already occupied');
  }
}
