import type { BetterExtract } from '@game/shared';
import type { Game } from '../game/game';
import type { MinionPosition } from '../game/interactions/selecting-minion-slots.interaction';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  Affinity,
  ArtifactKind,
  Tag,
  CARD_DECK_SOURCES,
  CardSpeed
} from './card.enums';
import type { ArtifactCard } from './entities/artifact.entity';
import { Card, type AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { Ability, AbilityOwner } from './entities/ability.entity';
import type { MinionSlotZone } from '../board/board;constants';

export type CardSourceBlueprint =
  | {
      deckSource: typeof CARD_DECK_SOURCES.MAIN_DECK;
      manaCost: number;
    }
  | {
      deckSource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
      destinyCost: number;
    };
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
  speed: CardSpeed;
  // eslint-disable-next-line @typescript-eslint/ban-types
  tags: (Tag | (string & {}))[];
} & CardSourceBlueprint;

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
      zone: MinionSlotZone;
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

export type MinionBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  onInit: (game: Game, card: MinionCard) => Promise<void>;
  canPlay: (game: Game, card: MinionCard) => boolean;
  onPlay: (game: Game, card: MinionCard) => Promise<void>;
  atk: number;
  maxHp: number;
  abilities: AbilityBlueprint<MinionCard, PreResponseTarget>[];
};
export type SpellBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  onPlay: (game: Game, card: SpellCard, targets: PreResponseTarget[]) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  getPreResponseTargets: (game: Game, card: SpellCard) => Promise<PreResponseTarget[]>;
};
export type HeroBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.HERO>;
  lineage: string | null;
  level: number;
  onInit: (game: Game, card: HeroCard) => Promise<void>;
  onPlay: (game: Game, card: HeroCard, originalCard: HeroCard) => Promise<void>;
  canPlay: (game: Game, card: HeroCard) => boolean;
  atk: number;
  maxHp: number;
  spellPower: number;
  affinities: Affinity[];
  abilities: AbilityBlueprint<HeroCard, PreResponseTarget>[];
};

export type ArtifactBlueprint = CardBlueprintBase & {
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
  | HeroBlueprint;
