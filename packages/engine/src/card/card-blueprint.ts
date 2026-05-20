import type { Game } from '../game/game';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  Tag,
  Job,
  Affinity,
  CardSpeed,
  MinionType
} from './card.enums';
import { type AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { Ability, AbilityOwner } from './entities/ability.entity';
import type { DestinyCard } from './entities/destiny.entity';
import type { InteractionResult } from '../game/systems/game-interaction.system';
import type { GameEvent } from '../game/game.events';
import type { TrapCard } from './entities/trap.entity';
import type { BoardSpace } from '../board/board-space.entity';

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
  affinities: Affinity[];
};

export type AbilityBlueprint<TCard extends AbilityOwner, TCardTarget extends AnyCard> = {
  id: string;
  manaCost: number;
  description: string;
  dynamicDescription?: (game: Game, card: TCard) => string;
  label: string;
  isHiddenOnCard?: boolean;
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
  targets: SerializedPreResponseTarget | null;
  isHiddenOnCard: boolean;
};

export type Targets<TCard extends AnyCard = AnyCard> = {
  cards: TCard[];
  spaces: BoardSpace[];
};
export type SerializedPreResponseTarget = {
  cards: string[];
  spaces: string[];
};

export const serializePreResponseTarget = (
  targets: Targets
): SerializedPreResponseTarget => {
  return {
    cards: targets.cards.map(card => card.id),
    spaces: targets.spaces.map(space => space.id)
  };
};

export type MinionBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  manaCost: number;
  speed: CardSpeed;
  atk: number;
  maxHp: number;
  abilities: AbilityBlueprint<MinionCard, any>[];
  jobs: Job[];
  subKind: MinionType;
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
  canPlay: (game: Game, card: HeroCard) => boolean;
  maxHp: number;
  abilities: AbilityBlueprint<HeroCard, any>[];
  aiHints: {
    shouldPlay: (game: Game, card: HeroCard) => number;
  };
};

export type DestinyBlueprint<T extends AnyCard = AnyCard> = CardBlueprintBase & {
  expCost: number;
  kind: Extract<CardKind, typeof CARD_KINDS.DESTINY>;
  jobs: Job[];
  onInit: (game: Game, card: DestinyCard) => Promise<void>;
  onPlay: (game: Game, card: DestinyCard, targets: Targets<T>) => Promise<void>;
  canPlay: (game: Game, card: DestinyCard) => boolean;
  getTargets: (game: Game, card: DestinyCard) => Promise<InteractionResult<Targets<T>>>;
  aiHints: {
    shouldPlay: (game: Game, card: DestinyCard) => number;
  };
};

export type TrapBlueprint = CardBlueprintBase & {
  manaCost: number;
  triggerCost: number;
  kind: Extract<CardKind, typeof CARD_KINDS.TRAP>;
  jobs: Job[];
  onInit: (game: Game, card: AnyCard) => Promise<void>;
  canPlay: (game: Game, card: TrapCard) => boolean;
  onTrigger: (game: Game, card: TrapCard, event: GameEvent) => Promise<void>;
  shouldTrigger: (game: Game, card: TrapCard, event: GameEvent) => boolean;
  aiHints: {
    shouldPlay: (game: Game, card: DestinyCard) => number;
  };
};

export type CardBlueprint =
  | SpellBlueprint<any>
  | MinionBlueprint
  | HeroBlueprint
  | DestinyBlueprint
  | TrapBlueprint;
