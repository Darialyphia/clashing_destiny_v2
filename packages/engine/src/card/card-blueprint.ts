import type { BetterExtract } from '@game/shared';
import type { Game } from '../game/game';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  ArtifactKind,
  Tag,
  Job,
  Affinity
} from './card.enums';
import type { ArtifactCard } from './entities/artifact.entity';
import { type AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { Ability, AbilityOwner } from './entities/ability.entity';
import type { DestinyCard } from './entities/destiny.entity';

export type CardArt = {
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
    brightShine?: boolean;
  };
  bg: string;
  main: string;
  foilBg?: string;
  foilMain?: string;
  isFullArt: boolean;
};

export type CardBlueprintBase = {
  id: string;
  name: string;
  description: string | (() => string);
  dynamicDescription?: (game: Game, card: AnyCard) => string;
  setId: CardSetId;
  rarity: Rarity;
  art: Record<string, CardArt>;
  collectable: boolean;
  unique?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  tags: (Tag | (string & {}))[];
  affinity: Affinity;
};

export type AbilityBlueprint<TCard extends AbilityOwner, TTarget extends Target> = {
  id: string;
  manaCost: number;
  description: string;
  dynamicDescription?: (game: Game, card: TCard) => string;
  label: string;
  isHiddenOnCard?: boolean;
  getTargets: (game: Game, card: TCard) => Promise<TTarget[]>;
  canUse(game: Game, card: TCard): boolean;
  onResolve(game: Game, card: TCard, targets: TTarget[], ability: Ability<TCard>): void;
  aiHints: {
    shouldUse: (game: Game, card: TCard) => number;
  };
};

export type AnyAbility = AbilityBlueprint<AbilityOwner, Target>;

export type SerializedAbility = {
  id: string;
  entityType: 'ability';
  abilityId: string;
  canUse: boolean;
  label: string;
  manaCost: number;
  description: string;
  targets: SerializedPreResponseTarget[] | null;
  isHiddenOnCard: boolean;
};

export type Target = AnyCard;
export type SerializedPreResponseTarget = string;

export const serializePreResponseTarget = (
  target: Target
): SerializedPreResponseTarget => {
  return target.id;
};

export type MinionBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  manaCost: number;
  atk: number;
  maxHp: number;
  abilities: AbilityBlueprint<MinionCard, Target>[];
  jobs: Job[];
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
  manaCost: number;
  jobs: Job[];
  abilities: AbilityBlueprint<SpellCard, Target>[];
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  onPlay: (game: Game, card: SpellCard, targets: Target[]) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  getTargets: (game: Game, card: SpellCard) => Promise<Target[]>;
  aiHints: {
    shouldPlay: (game: Game, card: SpellCard) => number;
  };
};

export type HeroBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.HERO>;
  jobs: Job[];
  advancedAffinity: Affinity;
  onInit: (game: Game, card: HeroCard) => Promise<void>;
  onPlay: (game: Game, card: HeroCard, originalCard: HeroCard) => Promise<void>;
  canPlay: (game: Game, card: HeroCard) => boolean;
  atk: number;
  maxHp: number;
  abilities: AbilityBlueprint<HeroCard, Target>[];
  aiHints: {
    shouldPlay: (game: Game, card: HeroCard) => number;
    shouldAttack: (game: Game, card: HeroCard) => number;
  };
};

export type ArtifactBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  manaCost: number;
  jobs: Job[];
  onInit: (game: Game, card: ArtifactCard) => Promise<void>;
  canPlay: (game: Game, card: ArtifactCard) => boolean;
  onPlay: (game: Game, card: ArtifactCard) => Promise<void>;
  abilities: Array<AbilityBlueprint<ArtifactCard, Target> & { durabilityCost: number }>;
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

export type DestinyBlueprint = CardBlueprintBase & {
  expCost: number;
  kind: Extract<CardKind, typeof CARD_KINDS.DESTINY>;
  jobs: Job[];
  onInit: (game: Game, card: DestinyCard) => Promise<void>;
  onPlay: (game: Game, card: DestinyCard, targets: Target[]) => Promise<void>;
  canPlay: (game: Game, card: DestinyCard) => boolean;
  getTargets: (game: Game, card: DestinyCard) => Promise<Target[]>;
  aiHints: {
    shouldPlay: (game: Game, card: DestinyCard) => number;
  };
};

export type CardBlueprint =
  | SpellBlueprint
  | ArtifactBlueprint
  | MinionBlueprint
  | HeroBlueprint
  | DestinyBlueprint;
