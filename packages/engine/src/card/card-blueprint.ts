import type { Game } from '../game/game';
import type {
  CARD_KINDS,
  CardKind,
  CardSetId,
  Rarity,
  Tag,
  JobId,
  Rune
} from './card.enums';
import type { MinionCard } from './entities/minion-card.entity';
import type { SpellCard } from './entities/spell-card.entity';
import type { ArtifactCard } from './entities/artifact-card.entity';
import type { BoardCell } from '../board/entities/board-cell.entity';
import type { GenericAOEShape } from '../aoe/aoe-shape';
import type { PlayerArtifact } from '../player/player-artifact.entity';
import type { AnyCard } from './entities/card.entity';
import type { VFXSequence } from '../game/systems/vfx.system';
import type { Point } from '@game/shared';
import type { DestinyCard } from './entities/destiny-card.entity';
import type { HeroCard } from './entities/hero-card.entity';

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
  vfx: {
    spriteId: string;
  };
  sounds: {
    play?: string;
    walk?: string;
    attack?: string;
    dealDamage?: string;
    takeDamage?: string;
    death?: string;
  };
  runeCost: Partial<Record<Rune, number>>;
};

export type MinionBlueprint = CardBlueprintBase & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  manaCost: number;
  vfx: CardBlueprintBase['vfx'] & {
    sequences?: {
      play?: (
        game: Game,
        card: MinionCard,
        position: Point,
        targets: Point[]
      ) => VFXSequence;
    };
  };
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
  vfx: CardBlueprintBase['vfx'] & {
    sequences?: {
      play?: (
        game: Game,
        card: SpellCard,
        ctx: {
          targets: Point[];
          aoe: GenericAOEShape;
        }
      ) => VFXSequence;
    };
  };
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
  vfx: CardBlueprintBase['vfx'] & {
    sequences?: {
      play?: (
        game: Game,
        card: DestinyCard,
        ctx: {
          targets: Point[];
          aoe: GenericAOEShape;
        }
      ) => VFXSequence;
    };
  };
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
  manaCost: number;
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
  vfx: CardBlueprintBase['vfx'] & {
    sequences?: {
      play?: (
        game: Game,
        card: ArtifactCard,
        options: {
          targets: Point[];
          aoe: GenericAOEShape;
          artifact: PlayerArtifact;
        }
      ) => VFXSequence;
    };
  };
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
  aiHints: {
    shouldPlay: (game: Game, card: HeroCard) => number;
    shouldAttack: (game: Game, card: HeroCard) => number;
  };
};

export type CardBlueprint =
  | SpellBlueprint
  | ArtifactBlueprint
  | MinionBlueprint
  | DestinyBlueprint
  | HeroBlueprint;
