import type { BetterExtract, EmptyObject } from '@game/shared';
import type { Game } from '../game/game';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  ArtifactKind,
  Tag,
  CARD_DECK_SOURCES,
  CardTint,
  Job,
  RuneId
} from './card.enums';
import type { ArtifactCard } from './entities/artifact.entity';
import { type AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { Ability, AbilityOwner } from './entities/ability.entity';
import type { RuneCard } from './entities/rune.entity';

export type CardSourceBlueprint =
  | {
      deckSource: typeof CARD_DECK_SOURCES.MAIN_DECK;
      manaCost: number;
    }
  | {
      deckSource: typeof CARD_DECK_SOURCES.RUNE_DECK;
      manaCost?: never;
    };

export type CardBlueprintBase = {
  id: string;
  name: string;
  description: string | (() => string);
  dynamicDescription?: (game: Game, card: AnyCard) => string;
  setId: CardSetId;
  rarity: Rarity;
  art: Record<
    string,
    {
      dimensions: {
        width: number;
        height: number;
      };
      foil: {
        sheen?: boolean;
        oil?: boolean;
        gradient?: boolean;
        lightGradient?: boolean;
        scanlines?: boolean;
        goldenGlare?: boolean;
        glitter?: boolean;
        foilLayer?: boolean;
        noBackground?: boolean;
        noFrame?: boolean;
      };
      bg: string;
      main: string;
      breakout?: string;
      foilArt?: string;
      frame: string;
      tint: CardTint;
    }
  >;
  collectable: boolean;
  unique?: boolean;
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
  dynamicDescription?: (game: Game, card: TCard) => string;
  label: string;
  isHiddenOnCard?: boolean;
  getPreResponseTargets: (game: Game, card: TCard) => Promise<TTarget[]>;
  canUse(game: Game, card: TCard): boolean;
  onResolve(game: Game, card: TCard, targets: TTarget[], ability: Ability<TCard>): void;
  aiHints: {
    shouldUse: (game: Game, card: TCard) => number;
  };
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
  isHiddenOnCard: boolean;
  shouldExhaust: boolean;
};

export type PreResponseTarget = AnyCard & { effectId?: string };
export type SerializedPreResponseTarget = string;

export const serializePreResponseTarget = (
  target: PreResponseTarget
): SerializedPreResponseTarget => {
  return target.id;
};

export type MinionBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  atk: number;
  maxHp: number;
  abilities: AbilityBlueprint<MinionCard, PreResponseTarget>[];
  jobs: Job[];
  runeCost: Partial<Record<RuneId, number>>;
  canPlay: (game: Game, card: MinionCard) => boolean;
  onInit: (game: Game, card: MinionCard) => Promise<void>;
  onPlay: (game: Game, card: MinionCard) => Promise<void>;
  aiHints: {
    shouldPlay: (game: Game, card: MinionCard) => number;
    shouldMove: (game: Game, card: MinionCard) => number;
    shouldAttack: (game: Game, card: MinionCard) => number;
    getThreatScore: (game: Game, card: MinionCard) => number;
  };
};

export type SpellBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  jobs: Job[];
  runeCost: Partial<Record<RuneId, number>>;
  abilities: AbilityBlueprint<SpellCard, PreResponseTarget>[];
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  onPlay: (game: Game, card: SpellCard, targets: PreResponseTarget[]) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  getPreResponseTargets: (game: Game, card: SpellCard) => Promise<PreResponseTarget[]>;
  aiHints: {
    shouldPlay: (game: Game, card: SpellCard) => number;
  };
};

export type HeroBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.HERO>;
  lineage: string | null;
  level: number;
  jobs: Job[];
  onInit: (game: Game, card: HeroCard) => Promise<void>;
  onPlay: (game: Game, card: HeroCard, originalCard: HeroCard) => Promise<void>;
  canPlay: (game: Game, card: HeroCard) => boolean;
  atk: number;
  maxHp: number;
  abilities: AbilityBlueprint<HeroCard, PreResponseTarget>[];
  aiHints: {
    shouldPlay: (game: Game, card: HeroCard) => number;
    shouldAttack: (game: Game, card: HeroCard) => number;
  };
};

export type ArtifactBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  jobs: Job[];
  runeCost: Partial<Record<RuneId, number>>;
  onInit: (game: Game, card: ArtifactCard) => Promise<void>;
  canPlay: (game: Game, card: ArtifactCard) => boolean;
  onPlay: (game: Game, card: ArtifactCard) => Promise<void>;
  abilities: Array<
    AbilityBlueprint<ArtifactCard, PreResponseTarget> & { durabilityCost: number }
  >;
  durability: number;
  aiHints: {
    shouldPlay: (game: Game, card: ArtifactCard) => number;
  };
} & (
    | {
        subKind: BetterExtract<ArtifactKind, 'ARMOR' | 'RELIC'>;
      }
    | {
        subKind: BetterExtract<ArtifactKind, 'WEAPON'>;
        atkBonus: number;
      }
  );

export type RuneBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.RUNE>;
  jobs: Job[];
  runeProduction: RuneId[];
  onInit: (game: Game, card: AnyCard) => Promise<void>;
  onPlay: (game: Game, card: AnyCard) => Promise<void>;
  abilities: AbilityBlueprint<RuneCard, PreResponseTarget>[];
  aiHints: EmptyObject;
};

export type CardBlueprint =
  | SpellBlueprint
  | ArtifactBlueprint
  | MinionBlueprint
  | HeroBlueprint
  | RuneBlueprint;
