import type { Game } from '../game/game';
import type { CARD_KINDS, CardKind, CardSetId, Rarity, Tag, JobId } from './card.enums';
import type { MinionCard } from './entities/minion-card.entity';
import type { SpellCard } from './entities/spell-card.entity';
import type { ArtifactCard } from './entities/artifact-card.entity';
import type { BoardCell } from '../board/entities/board-cell.entity';
import type { GenericAOEShape } from '../aoe/aoe-shape';
import type { PlayerArtifact } from '../player/player-artifact.entity';
import type { AnyCard } from './entities/card.entity';
import type { DestinyCard } from './entities/destiny-card.entity';
import type { HeroCard } from './entities/hero-card.entity';

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
  description: string;
  setId: CardSetId;
  rarity: Rarity;
  collectable: boolean;
  jobs: JobId[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  tags: (Tag | (string & {}))[];
  art: Record<string, CardArt>;
};

export type MinionBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  manaCost: number;
  abilities: AbilityBlueprint<MinionCard>[];
  onInit: (game: Game, card: MinionCard) => Promise<void>;
  canPlay: (game: Game, card: MinionCard) => boolean;
  onPlay: (
    game: Game,
    card: MinionCard,
    options: {
      position: BoardCell;
    }
  ) => Promise<void>;
  atk: number;
  retaliation: number;
  maxHp: number;
};

export type SpellBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  manaCost: number;
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  onPlay: (
    game: Game,
    card: SpellCard,
    options: {
      targets: BoardCell[];
      aoe: GenericAOEShape;
    }
  ) => Promise<void>;
  getTargets: (game: Game, card: SpellCard) => Promise<BoardCell[]>;
  getAoe: (game: Game, card: SpellCard, targets: BoardCell[]) => GenericAOEShape;
};

export type DestinyBlueprint = CardBlueprintBase & {
  expCost: number;
  kind: Extract<CardKind, typeof CARD_KINDS.DESTINY>;
  onInit: (game: Game, card: DestinyCard) => Promise<void>;
  canPlay: (game: Game, card: DestinyCard) => boolean;
  onPlay: (
    game: Game,
    card: DestinyCard,
    options: {
      targets: BoardCell[];
      aoe: GenericAOEShape;
    }
  ) => Promise<void>;
  getTargets: (game: Game, card: DestinyCard) => Promise<BoardCell[]>;
  getAoe: (game: Game, card: DestinyCard, targets: BoardCell[]) => GenericAOEShape;
};

export type AbilityBlueprint<T extends AnyCard> = {
  id: string;
  description: string;
  label: string;
  manaCost: number;
  isHiddenOnCard?: boolean;
  getTargets: (game: Game, card: T) => Promise<BoardCell[]>;
  getAoe: (game: Game, card: T, targets: BoardCell[]) => GenericAOEShape;
  getCooldown: (game: Game, card: T) => number;
  canUse(game: Game, card: T): boolean;
  onResolve(
    game: Game,
    card: T,
    options: {
      targets: BoardCell[];
      aoe: GenericAOEShape;
    }
  ): void;
};

export type ArtifactBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  durability: number;
  manaCost: number;
  abilities: AbilityBlueprint<ArtifactCard>[];
  onInit: (game: Game, card: ArtifactCard) => Promise<void>;
  canPlay: (game: Game, card: ArtifactCard) => boolean;
  onPlay: (
    game: Game,
    card: ArtifactCard,
    options: {
      targets: BoardCell[];
      aoe: GenericAOEShape;
      artifact: PlayerArtifact;
    }
  ) => Promise<void>;
  getTargets: (game: Game, card: ArtifactCard) => Promise<BoardCell[]>;
  getAoe: (game: Game, card: ArtifactCard, targets: BoardCell[]) => GenericAOEShape;
};

export type HeroBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.HERO>;
  jobs: JobId[];
  onInit: (game: Game, card: HeroCard) => Promise<void>;
  onPlay: (game: Game, card: HeroCard) => Promise<void>;
  atk: number;
  retaliation: number;
  maxHp: number;
  abilities: AbilityBlueprint<HeroCard>[];
};

export type CardBlueprint =
  | SpellBlueprint
  | ArtifactBlueprint
  | MinionBlueprint
  | DestinyBlueprint
  | HeroBlueprint;
