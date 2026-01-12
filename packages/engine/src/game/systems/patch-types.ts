import type { Config } from '../../config';
import type { SerializedGamePhaseContext } from './game-phase.system';
import type { SerializedInteractionContext } from './game-interaction.system';
import type { SerializedBoard } from '../../board/board-side.entity';
import type { SerializedEffectChain } from '../effect-chain';
import type { SerializedMinionCard } from '../../card/entities/minion.entity';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedSigilCard } from '../../card/entities/sigil.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedAbility } from '../../card/card-blueprint';

/**
 * JSON Patch operations (RFC 6902 inspired)
 * We use a subset focused on our game's needs
 */
export type PatchOperation = ReplacePatch | AddPatch | RemovePatch;

export interface ReplacePatch {
  op: 'replace';
  path: string; // e.g., 'atk', 'art.tint', 'modifiers[2]'
  value: any;
}

export interface AddPatch {
  op: 'add';
  path: string; // e.g., 'modifiers[-]' (append) or 'modifiers[2]' (insert at index)
  value: any;
}

export interface RemovePatch {
  op: 'remove';
  path: string; // e.g., 'modifiers[2]'
}

/**
 * Entity patches are grouped by entity ID
 */
export type EntityPatchMap = Record<string, PatchOperation[]>;

/**
 * Serialized entity union type
 */
export type SerializedEntity =
  | SerializedMinionCard
  | SerializedHeroCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedSigilCard
  | SerializedPlayer
  | SerializedModifier
  | SerializedAbility;

/**
 * New snapshot diff format using patches
 */
export type PatchBasedSnapshotDiff = {
  // Entities that changed - now as patches instead of partial objects
  entityPatches: EntityPatchMap;

  // Entities added (send full serialized data for these)
  addedEntities: Record<string, SerializedEntity>;

  // Entity IDs that were removed
  removedEntities: string[];

  // Top-level state changes (these are infrequent, so keep as partial)
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: SerializedBoard;
  turnCount: number;
  currentPlayer: string;
  players: string[];
  effectChain: SerializedEffectChain | null;
  config: Partial<Config>;
};

/**
 * Type guard utilities
 */
export function isReplacePatch(patch: PatchOperation): patch is ReplacePatch {
  return patch.op === 'replace';
}

export function isAddPatch(patch: PatchOperation): patch is AddPatch {
  return patch.op === 'add';
}

export function isRemovePatch(patch: PatchOperation): patch is RemovePatch {
  return patch.op === 'remove';
}
