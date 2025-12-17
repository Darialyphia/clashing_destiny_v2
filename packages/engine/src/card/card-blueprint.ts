import type { BetterExtract } from '@game/shared';
import type { Game } from '../game/game';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  ArtifactKind,
  Tag,
  CARD_DECK_SOURCES,
  CardSpeed,
  Faction,
  Rune,
  CardTint
} from './card.enums';
import type { ArtifactCard } from './entities/artifact.entity';
import { type AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import type { SpellCard } from './entities/spell.entity';
import type { Ability, AbilityOwner } from './entities/ability.entity';
import type { SigilCard } from './entities/sigil.entity';

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
        scanlines?: boolean;
      };
      bg: string;
      main: string;
      breakout?: string;
      frame: string;
      tint: CardTint;
    }
  >;
  collectable: boolean;
  unique?: boolean;
  speed: CardSpeed;
  faction: Faction;
  runeCost: RuneCost;
  // eslint-disable-next-line @typescript-eslint/ban-types
  tags: (Tag | (string & {}))[];
} & CardSourceBlueprint;

export type AbilityBlueprint<
  TCard extends AbilityOwner,
  TTarget extends PreResponseTarget
> = {
  id: string;
  manaCost: number;
  runeCost: RuneCost;
  shouldExhaust: boolean;
  description: string;
  label: string;
  speed: CardSpeed;
  isHiddenOnCard?: boolean;
  getPreResponseTargets: (game: Game, card: TCard) => Promise<TTarget[]>;
  canUse(game: Game, card: TCard): boolean;
  onResolve(game: Game, card: TCard, targets: TTarget[], ability: Ability<TCard>): void;
};

export type RuneCost = Partial<Record<Rune, number>>;
export type AnyAbility = AbilityBlueprint<AbilityOwner, PreResponseTarget>;

export type SerializedAbility = {
  id: string;
  entityType: 'ability';
  abilityId: string;
  canUse: boolean;
  name: string;
  manaCost: number;
  runeCost: RuneCost;
  description: string;
  speed: CardSpeed;
  targets: SerializedPreResponseTarget[] | null;
  isHiddenOnCard: boolean;
};

export type PreResponseTarget = AnyCard;
export type SerializedPreResponseTarget = string;

export const serializePreResponseTarget = (
  target: PreResponseTarget
): SerializedPreResponseTarget => {
  return target.id;
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
  abilities: AbilityBlueprint<SpellCard, PreResponseTarget>[];
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

export type SigilBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SIGIL>;
  onInit: (game: Game, card: SigilCard) => Promise<void>;
  canPlay: (game: Game, card: SigilCard) => boolean;
  onPlay: (game: Game, card: SigilCard) => Promise<void>;
  maxCountdown: number;
  abilities: AbilityBlueprint<SigilCard, PreResponseTarget>[];
  runeCost: RuneCost;
};

export type CardBlueprint =
  | SpellBlueprint
  | ArtifactBlueprint
  | MinionBlueprint
  | HeroBlueprint
  | SigilBlueprint;
