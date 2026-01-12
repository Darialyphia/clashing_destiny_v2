import type { Game } from '../game';
import type { Config } from '../../config';
import { GAME_EVENTS, type GameStarEvent } from '../game.events';
import type { CardDeclarePlayEvent, CardDiscardEvent } from '../../card/card.events';
import type { ChainEffectAddedEvent, SerializedEffectChain } from '../effect-chain';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.entity';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedGamePhaseContext } from './game-phase.system';
import type { SerializedInteractionContext } from './game-interaction.system';
import type { SerializedBoard } from '../../board/board-side.entity';
import type { AnyObject } from '@game/shared';
import { areArraysIdentical } from '../../utils/utils';
import type { SerializedAbility } from '../../card/card-blueprint';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';
import { INTERACTION_STATES } from '../game.enums';
import type { SerializedSigilCard } from '../../card/entities/sigil.entity';
import { CARD_LOCATIONS } from '../../card/card.enums';
import { DeepDiffer } from './deep-differ';
import type { PatchBasedSnapshotDiff, EntityPatchMap } from './patch-types';

export type EntityDictionary = Record<
  string,
  | SerializedMinionCard
  | SerializedHeroCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedSigilCard
  | SerializedPlayer
  | SerializedModifier
  | SerializedAbility
>;

export type EntityDiffDictionary = Record<
  string,
  | Partial<SerializedMinionCard>
  | Partial<SerializedSpellCard>
  | Partial<SerializedArtifactCard>
  | Partial<SerializedHeroCard>
  | Partial<SerializedSigilCard>
  | Partial<SerializedPlayer>
  | Partial<SerializedModifier>
  | Partial<SerializedAbility>
>;

export type SerializedOmniscientState = {
  config: Config;
  entities: EntityDictionary;
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  players: string[];
  board: SerializedBoard;
  currentPlayer: string;
  turnCount: number;
  effectChain: SerializedEffectChain | null;
};

export type SnapshotDiff = {
  config: Partial<Config>;
  entities: EntityDiffDictionary;
  addedEntities: string[];
  removedEntities: string[];
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: SerializedBoard;
  turnCount: number;
  currentPlayer: string;
  players: string[];
  effectChain: SerializedEffectChain | null;
};

export type SerializedPlayerState = SerializedOmniscientState;

export class GameSerializer {
  private game: Game;
  // a set of opponent's cards that have been seen by each player
  // once a card is marked, it will not be filtered out when sanitizing a player state snapshot
  private seenCardsByPlayer: Record<string, Set<string>> = {};
  private deepDiffer = new DeepDiffer();

  constructor(game: Game) {
    this.game = game;
  }

  initialize() {
    this.seenCardsByPlayer[this.game.playerSystem.player1.id] = new Set();
    this.seenCardsByPlayer[this.game.playerSystem.player2.id] = new Set();
  }

  getObjectDiff<T extends AnyObject>(obj: T, prevObj: T | undefined): Partial<T> {
    if (!prevObj) return { ...obj };
    const result: Partial<T> = {};
    for (const key in obj) {
      if (Array.isArray(obj[key]) && Array.isArray(prevObj[key])) {
        if (!areArraysIdentical(obj[key], prevObj[key])) {
          result[key] = obj[key];
        }
      } else if (obj[key] !== prevObj[key]) {
        result[key] = obj[key];
      }
    }
    for (const key in prevObj) {
      if (!(key in obj)) {
        result[key] = undefined;
      }
    }
    return result;
  }

  diffSnapshots(
    state: SerializedOmniscientState,
    prevState: SerializedOmniscientState
  ): SnapshotDiff {
    const entities: EntityDiffDictionary = {};
    for (const [key, entity] of Object.entries(state.entities)) {
      const diff = this.getObjectDiff(entity, prevState.entities[key]);
      if (Object.keys(diff).length > 0) {
        entities[key] = diff;
      }
    }
    return {
      config: this.getObjectDiff(state.config, prevState.config),
      entities,
      removedEntities: Object.keys(prevState.entities).filter(
        key => !(key in state.entities)
      ),
      addedEntities: Object.keys(state.entities).filter(
        key => !(key in prevState.entities)
      ),
      phase: state.phase,
      interaction: state.interaction,
      board: state.board,
      turnCount: state.turnCount,
      currentPlayer: state.currentPlayer,
      players: state.players,
      effectChain: state.effectChain
    };
  }

  /**
   * Generate patch-based snapshot diff
   * This performs deep diffing and generates granular patches for entity changes
   */
  diffSnapshotsWithPatches(
    state: SerializedOmniscientState,
    prevState: SerializedOmniscientState
  ): PatchBasedSnapshotDiff {
    const entityPatches: EntityPatchMap = {};
    const addedEntities: Record<string, any> = {};
    const removedEntityIds: string[] = [];

    // Find added entities
    for (const [id, entity] of Object.entries(state.entities)) {
      if (!(id in prevState.entities)) {
        addedEntities[id] = entity;
      }
    }

    // Find removed entities
    for (const id in prevState.entities) {
      if (!(id in state.entities)) {
        removedEntityIds.push(id);
      }
    }

    // Generate patches for existing entities that changed
    for (const [id, entity] of Object.entries(state.entities)) {
      if (id in prevState.entities) {
        const patches = this.deepDiffer.generatePatches(entity, prevState.entities[id]);

        // Only include if there are actual changes
        if (patches.length > 0) {
          entityPatches[id] = patches;
        }
      }
    }

    return {
      entityPatches,
      addedEntities,
      removedEntities: removedEntityIds,
      phase: state.phase,
      interaction: state.interaction,
      board: state.board,
      turnCount: state.turnCount,
      currentPlayer: state.currentPlayer,
      players: state.players,
      effectChain: state.effectChain,
      config: this.getObjectDiff(state.config, prevState.config)
    };
  }

  private buildEntityDictionary(): EntityDictionary {
    const entities: EntityDictionary = {};
    this.game.cardSystem.cards.forEach(card => {
      entities[card.id] = card.serialize();
      card.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
      if ('abilities' in card) {
        (card.abilities as Ability<AbilityOwner>[]).forEach(ability => {
          entities[ability.id] = ability.serialize();
        });
      }
    });
    this.game.playerSystem.players.forEach(player => {
      entities[player.id] = player.serialize();
      player.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    return entities;
  }

  /**
   * Serializes the complete game state with full visibility (for spectator / sandbox mode)
   */
  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary(),
      phase: this.game.gamePhaseSystem.serialize(),
      interaction: this.game.interaction.serialize(),
      board: this.game.boardSystem.serialize(),
      players: this.game.playerSystem.players.map(player => player.id),
      currentPlayer: this.game.interaction.interactivePlayer.id,
      turnCount: this.game.turnSystem.elapsedTurns,
      effectChain: this.game.effectChainSystem.serialize()
    };
  }

  /**
   * Serializes the game state for a specific player, hiding opponent's hidden information
   */
  serializePlayerState(
    playerId: string,
    eventsSinceLastSnapshot: GameStarEvent[]
  ): SerializedPlayerState {
    const state = this.serializeOmniscientState();

    // Remove entities that the player shouldn't have access to in order to prevent cheating
    const shouldBeSeen = (cardId: string) => {
      if (state.interaction.ctx.player === playerId) {
        // add card from buckets when rearrangign cards since they could come from a hidden source (like deck or opponent's hand)
        if (state.interaction.state === INTERACTION_STATES.REARRANGING_CARDS) {
          const buckets = state.interaction.ctx.buckets;
          for (const bucket of buckets) {
            if (bucket.cards.includes(cardId)) {
              return true;
            }
          }
        }
        // same thing
        if (state.interaction.state === INTERACTION_STATES.CHOOSING_CARDS) {
          const choices = state.interaction.ctx.choices;
          if (choices.includes(cardId)) {
            return true;
          }
        }
      }

      return eventsSinceLastSnapshot.some(e => {
        const event = e.data.event;
        if (
          e.data.eventName === GAME_EVENTS.CARD_DECLARE_PLAY &&
          (event as CardDeclarePlayEvent).data.card.id === cardId
        ) {
          return true;
        }
        if (e.data.eventName === GAME_EVENTS.EFFECT_CHAIN_EFFECT_ADDED) {
          const effect = (event as ChainEffectAddedEvent).data.effect;
          if (effect.source.id === cardId) {
            return true;
          }
        }
        if (
          e.data.eventName === GAME_EVENTS.CARD_DISCARD &&
          (event as CardDiscardEvent).data.card.id === cardId
        ) {
          return true;
        }
        return false;
      });
    };

    const cardsToRemove: string[] = [];
    this.game.cardSystem.cards.forEach(card => {
      if (card.player.id === playerId) return;
      if (
        card.location === CARD_LOCATIONS.BANISH_PILE ||
        card.location === CARD_LOCATIONS.BOARD ||
        card.location === CARD_LOCATIONS.DISCARD_PILE
      ) {
        return;
      }
      if (this.seenCardsByPlayer[playerId].has(card.id)) {
        return;
      }
      const seen = shouldBeSeen(card.id);

      if (seen) {
        this.seenCardsByPlayer[playerId].add(card.id);
        return;
      }

      cardsToRemove.push(card.id);
    });

    // prune unseen cards and their related entities
    cardsToRemove.forEach(cardId => {
      const card = this.game.cardSystem.getCardById(cardId)!;

      card.modifiers.list.forEach(modifier => {
        delete state.entities[modifier.id];
      });
      if ('abilities' in card) {
        (card.abilities as Ability<AbilityOwner>[]).forEach(ability => {
          delete state.entities[ability.id];
        });
      }
      delete state.entities[cardId];
    });

    return state;
  }
}
