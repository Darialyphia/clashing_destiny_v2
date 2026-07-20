import type { Game } from '../game/game';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  Tag,
  Job,
  Affinity,
  CardSpeed
} from './card.enums';
import { type AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { Ability, AbilityOwner } from './entities/ability.entity';
import type { InteractionResult } from '../game/systems/game-interaction.system';
import type { ArtifactCard } from './entities/artifact.entity';
import type { BoardSpace } from '../board/board-space.entity';
import type { DestinyCard } from './entities/destiny.entity';
import type { Effect } from '../game/effect-chain';
import type { Nullable } from '@game/shared';

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
  speed: CardSpeed;
  // eslint-disable-next-line @typescript-eslint/ban-types
  tags: (Tag | (string & {}))[];
  affinities: Affinity[];
  shouldHideTargetarrows?: boolean;
};

export type AbilityBlueprint<TCard extends AbilityOwner, TCardTarget extends AnyCard> = {
  id: string;
  manaCost: number;
  description: string;
  dynamicDescription?: (game: Game, card: TCard) => string;
  label: string;
  isHiddenOnCard?: boolean;
  shouldExhaust?: boolean;
  shouldHideTargetarrows?: boolean;
  getTargets: (
    game: Game,
    card: TCard
  ) => Promise<InteractionResult<Targets<TCardTarget>>>;
  canUse(game: Game, card: TCard): boolean;
  onResolve(
    game: Game,
    card: TCard,
    targets: Targets<TCardTarget>,
    ability: Ability<TCard>
  ): Promise<void>;
  aiHints: {
    shouldUse: (game: Game, card: TCard) => number;
  };
};
export const defineAbility = <TCard extends AbilityOwner, TCardTarget extends AnyCard>(
  bp: AbilityBlueprint<TCard, TCardTarget>
): AbilityBlueprint<TCard, TCardTarget> => bp;

export type AnyAbility = AbilityBlueprint<AbilityOwner, AnyCard>;

export type SerializedAbility = {
  id: string;
  entityType: 'ability';
  abilityId: string;
  canUse: boolean;
  label: string;
  manaCost: number;
  description: string;
  targets: SerializedTargets | null;
  isHiddenOnCard: boolean;
  shouldExhaust: boolean;
};

export type Targets<TCard extends AnyCard = AnyCard> = {
  cards: TCard[];
  spaces: BoardSpace[];
  effect: Nullable<Effect>;
};
export type SerializedTargets = {
  cards: string[];
  spaces: string[];
  effect: string | null;
};

export const serializeTargets = (targets: Targets): SerializedTargets => {
  return {
    cards: targets.cards.map(card => card.id),
    spaces: targets.spaces.map(space => space.id),
    effect: targets.effect ? targets.effect.id : null
  };
};

export type MinionBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  manaCost: number;
  maxHp: number;
  atk: number;
  commandment: number;
  abilities: AbilityBlueprint<MinionCard, any>[];
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

export type SpellBlueprint<T extends AnyCard = AnyCard> = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  manaCost: number;
  speed: CardSpeed;
  jobs: Job[];
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  onPlay: (game: Game, card: SpellCard, targets: Targets<T>) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  getTargets: (game: Game, card: SpellCard) => Promise<InteractionResult<Targets<T>>>;
  aiHints: {
    shouldPlay: (game: Game, card: SpellCard) => number;
  };
};

export type HeroBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.HERO>;
  jobs: Job[];
  onInit: (game: Game, card: HeroCard) => Promise<void>;
  onPlay: (game: Game, card: HeroCard, originalCard: HeroCard) => Promise<void>;
  abilities: AbilityBlueprint<HeroCard, any>[];
  aiHints: {
    shouldPlay: (game: Game, card: HeroCard) => number;
  };
};

export type ArtifactBlueprint = CardBlueprintBase & {
  manaCost: number;
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  jobs: Job[];
  durability: number;
  abilities: AbilityBlueprint<ArtifactCard, any>[];
  onInit: (game: Game, card: ArtifactCard) => Promise<void>;
  canPlay: (game: Game, card: ArtifactCard) => boolean;
  onPlay: (game: Game, card: ArtifactCard) => Promise<void>;
  aiHints: {
    shouldPlay: (game: Game, card: ArtifactCard) => number;
  };
};

export type DestinyBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.DESTINY>;
  jobs: Job[];
  onInit: (game: Game, card: DestinyCard) => Promise<void>;
  onPlay: (game: Game, card: DestinyCard) => Promise<void>;
};

export type CardBlueprint =
  | SpellBlueprint<any>
  | MinionBlueprint
  | HeroBlueprint
  | ArtifactBlueprint
  | DestinyBlueprint;
