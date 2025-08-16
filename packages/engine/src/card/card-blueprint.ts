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
import { Card, type AnyCard } from './entities/card.entity';
import type { DestinyCard } from './entities/destiny.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { Ability, AbilityOwner } from './entities/ability.entity';

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

export type AbilityBlueprint<
  TCard extends AbilityOwner,
  TTarget extends PreResponseTarget
> = {
  id: string;
  manaCost: number;
  shouldExhaust: boolean;
  description: string;
  label: string;
  getPreResponseTargets: (game: Game, card: TCard) => Promise<TTarget[]>;
  canUse(game: Game, card: TCard): boolean;
  onResolve(game: Game, card: TCard, targets: TTarget[], ability: Ability<TCard>): void;
};

export type AnyAbility = AbilityBlueprint<AbilityOwner, PreResponseTarget>;

export type SerializedAbility = {
  id: string;
  entityType: 'ability';
  abilityId: string;
  canUse: boolean;
  name: string;
  manaCost: number;
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
  abilities: AbilityBlueprint<MinionCard, PreResponseTarget>[];
};
export type SpellBlueprint = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  subKind: SpellKind;
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  onPlay: (game: Game, card: SpellCard, targets: PreResponseTarget[]) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  getPreResponseTargets: (game: Game, card: SpellCard) => Promise<PreResponseTarget[]>;
};
export type HeroBlueprint = CardBlueprintBase & {
  deckSource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
  kind: Extract<CardKind, typeof CARD_KINDS.HERO>;
  lineage: string | null;
  onInit: (game: Game, card: HeroCard) => Promise<void>;
  onPlay: (game: Game, card: HeroCard, originalCard: HeroCard) => Promise<void>;
  atk: number;
  maxHp: number;
  spellPower: number;
  affinities: Affinity[];
  abilities: AbilityBlueprint<HeroCard, PreResponseTarget>[];
};

export type DestinyBlueprint = CardBlueprintBase & {
  deckSource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
  kind: Extract<CardKind, typeof CARD_KINDS.DESTINY>;
  destinyCost: number;
  minLevel: number;
  countsAsLevel: boolean;
  onInit: (game: Game, card: DestinyCard) => Promise<void>;
  onPlay: (game: Game, card: DestinyCard) => Promise<void>;
  affinity: Affinity;
  abilities: AbilityBlueprint<DestinyCard, PreResponseTarget>[];
};

export type ArtifactBlueprint = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  onInit: (game: Game, card: ArtifactCard) => Promise<void>;
  canPlay: (game: Game, card: ArtifactCard) => boolean;
  onPlay: (game: Game, card: ArtifactCard) => Promise<void>;
  abilities: AbilityBlueprint<ArtifactCard, PreResponseTarget>[];
  durability: number;
} & (
    | {
        subKind: BetterExtract<ArtifactKind, 'ARMOR' | 'RELIC'>;
      }
    | {
        subKind: BetterExtract<ArtifactKind, 'WEAPON'>;
        atkBonus: number;
      }
  );

export type TalentTreeNodeBlueprint = {
  id: string;
  name: string;
  description: string;
  level: number;
  parentIds: string[];
  iconId: string;
  destinyCost: number;
  exclusiveWith?: string[];
  onUnlock: (game: Game, hero: HeroCard) => Promise<void>;
};

export type TalentTreeBlueprint = {
  nodes: TalentTreeNodeBlueprint[];
};

export type CardBlueprint =
  | SpellBlueprint
  | ArtifactBlueprint
  | MinionBlueprint
  | HeroBlueprint
  | DestinyBlueprint;
