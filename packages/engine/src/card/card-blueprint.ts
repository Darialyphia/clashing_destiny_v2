import type { BetterExtract } from '@game/shared';
import type { Game } from '../game/game';
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
import { type AnyCard } from './entities/card.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.card';
import type { SpellCard } from './entities/spell.entity';

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

export type SerializedAbility = {
  id: string;
  canUse: boolean;
  name: string;
  description: string;
  targets: SerializedPreResponseTarget[] | null;
};

export type PreResponseTarget = AnyCard;
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
  return {
    type: 'card',
    card: target.id
  };
};

export type MinionBlueprint = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.MINION>;
  onInit: (game: Game, card: MinionCard) => Promise<void>;
  canPlay: (game: Game, card: MinionCard) => boolean;
  onPlay: (game: Game, card: MinionCard) => Promise<void>;
  speed: number;
  atk: number;
  maxHp: number;
};
export type SpellBlueprint<T extends PreResponseTarget> = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.SPELL>;
  subKind: SpellKind;
  onInit: (game: Game, card: SpellCard) => Promise<void>;
  onPlay: (game: Game, card: SpellCard, targets: T[]) => Promise<void>;
  canPlay: (game: Game, card: SpellCard) => boolean;
  getPreResponseTargets: (game: Game, card: SpellCard) => Promise<T[]>;
};

export type HeroBlueprint = CardBlueprintBase & {
  deckSource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
  kind: Extract<CardKind, typeof CARD_KINDS.HERO>;
  lineage: string | null;
  onInit: (game: Game, card: HeroCard) => Promise<void>;
  onPlay: (game: Game, card: HeroCard, originalCard: HeroCard) => Promise<void>;
  speed: number;
  atk: number;
  maxHp: number;
  spellPower: number;
  affinities: Affinity[];
};

export type ArtifactBlueprint = MainDeckCardBlueprint & {
  kind: Extract<CardKind, typeof CARD_KINDS.ARTIFACT>;
  onInit: (game: Game, card: ArtifactCard) => Promise<void>;
  canPlay: (game: Game, card: ArtifactCard) => boolean;
  onPlay: (game: Game, card: ArtifactCard) => Promise<void>;
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

export type CardBlueprint =
  | SpellBlueprint<any>
  | ArtifactBlueprint
  | MinionBlueprint
  | HeroBlueprint;
