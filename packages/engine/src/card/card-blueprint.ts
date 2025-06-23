import type { BetterExtract } from '@game/shared';
import type { Game } from '../game/game';
import type { MinionPosition } from '../game/interactions/selecting-minion-slots.interaction';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  CARD_DECK_SOURCES,
  Affinity,
  ArtifactKind,
  SpellKind,
  Tag
} from './card.enums';
import type { ArtifactCard } from './entities/artifact.entity';
import type { AttackCard } from './entities/attack.entity';
import { Card, type AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { LocationCard } from './entities/location.entity';
import type { MinionCard } from './entities/minion.card';
import type { SpellCard } from './entities/spell.entity';
import type { TalentCard } from './entities/talent.entity';
import type { AttackTarget } from '../game/phases/combat.phase';

export type CardBlueprintBase = {
  id: string;
  name: string;
  description: string;
  setId: CardSetId;
  rarity: Rarity;
  cardIconId: string;
  collectable: boolean;
  unique?: boolean;
  affinity: Affinity;
  // eslint-disable-next-line @typescript-eslint/ban-types
  tags: (Tag | (string & {}))[];
};

export type MainDeckCardBlueprint = CardBlueprintBase & {
  manaCost: number;
  deckSource: typeof CARD_DECK_SOURCES.MAIN_DECK;
};

export type DestinyDeckCardBlueprint = CardBlueprintBase & {
  destinyCost: number;
  deckSource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
};

export type Ability<TCard extends AnyCard, TTarget extends PreResponseTarget> = {
  id: string;
  manaCost: number;
  shouldExhaust: boolean;
  description: string;
  label: string;
  getPreResponseTargets: (game: Game, card: TCard) => Promise<TTarget[]>;
  canUse(game: Game, card: TCard): boolean;
  onResolve(game: Game, card: TCard, targets: TTarget[]): void;
};

export type AnyAbility = Ability<AnyCard, PreResponseTarget>;

export type SerializedAbility = {
  id: string;
  canUse: boolean;
  name: string;
  description: string;
  targets: SerializedPreResponseTarget[] | null;
};

export type PreResponseTarget = AnyCard | MinionPosition;
export type SerializedPreResponseTarget =
  | {
      type: 'card';
      card: string;
    }
  | {
      type: 'minionPosition';
      playerId: string;
      slot: number;
      zone: 'attack' | 'defense';
    };
export const serializePreResponseTarget = (
  target: PreResponseTarget
): SerializedPreResponseTarget => {
  if (target instanceof Card) {
    return {
      type: 'card',
      card: target.id
    };
  }
  return {
    type: 'minionPosition',
    playerId: target.player.id,
    slot: target.slot,
    zone: target.zone
  };
};

export type MinionBlueprint = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  onInit: (game: Game, card: MinionCard) => Promise<void>;
  canPlay: (game: Game, card: MinionCard) => boolean;
  onPlay: (game: Game, card: MinionCard) => Promise<void>;
  atk: number;
  maxHp: number;
  abilities: Ability<MinionCard, PreResponseTarget>[];
};
export type SpellBlueprint<T extends PreResponseTarget> = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  subKind: SpellKind;
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  onPlay: (game: Game, card: SpellCard, targets: T[]) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  getPreResponseTargets: (game: Game, card: SpellCard) => Promise<T[]>;
};
export type HeroBlueprint = DestinyDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.HERO>;
  level: 0 | 1 | 2 | 3;
  lineage: string | null;
  onInit: (game: Game, card: HeroCard) => Promise<void>;
  onPlay: (game: Game, card: HeroCard, originalCard: HeroCard) => Promise<void>;
  atk: number;
  maxHp: number;
  spellPower: number;
  unlockableAffinities: Affinity[];
  abilities: Ability<HeroCard, PreResponseTarget>[];
  talentTree: TalentTreeBlueprint;
};
export type LocationBlueprint = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.LOCATION>;
  abilities: Ability<LocationCard, PreResponseTarget>[];
  canPlay: (game: Game, card: LocationCard) => boolean;
  onInit: (game: Game, card: LocationCard) => Promise<void>;
  onPlay: (game: Game, card: LocationCard) => Promise<void>;
};
export type ArtifactBlueprint = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  onInit: (game: Game, card: ArtifactCard) => Promise<void>;
  canPlay: (game: Game, card: ArtifactCard) => boolean;
  onPlay: (game: Game, card: ArtifactCard) => Promise<void>;
  abilities: Ability<ArtifactCard, PreResponseTarget>[];
} & (
    | {
        subKind: BetterExtract<ArtifactKind, 'WEAPON'>;
        atk: number;
        durability: number;
      }
    | {
        subKind: BetterExtract<ArtifactKind, 'ARMOR'>;
        durability: number;
      }
    | {
        subKind: BetterExtract<ArtifactKind, 'RELIC'>;
        durability: number;
      }
  );
export type AttackBlueprint = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.ATTACK>;
  damage: number;
  getPreResponseTargets: (game: Game, card: AttackCard) => Promise<Array<AttackTarget>>;
  onInit: (game: Game, card: AttackCard) => Promise<void>;
  canPlay: (game: Game, card: AttackCard) => boolean;
  onPlay: (game: Game, card: AttackCard) => Promise<void>;
};

export type TalentBlueprint = DestinyDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.TALENT>;
  level: 0 | 1 | 2 | 3;
  heroId: string;
  onInit: (game: Game, card: TalentCard) => Promise<void>;
  onPlay: (game: Game, card: TalentCard) => Promise<void>;
};

export type TalentTreeNodeBlueprint = {
  id: string;
  name: string;
  description: string;
  level: 1 | 2 | 3 | 4;
  parentIds: string[];
  iconId: string;
  onResolve: (game: Game, hero: HeroCard) => Promise<void>;
};

export type TalentTreeBlueprint = {
  nodes: TalentTreeNodeBlueprint[];
  rootNodeIds: string[];
};

export type CardBlueprint =
  | SpellBlueprint<any>
  | ArtifactBlueprint
  | AttackBlueprint
  | TalentBlueprint
  | MinionBlueprint
  | HeroBlueprint
  | LocationBlueprint;
