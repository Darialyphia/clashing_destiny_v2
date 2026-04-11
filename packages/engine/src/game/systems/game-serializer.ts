import type { Game } from '../game';
import type { Config } from '../../config';
import { GAME_EVENTS, type GameStarEvent } from '../game.events';
import type { CardDiscardEvent } from '../../card/card.events';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedGamePhaseContext } from './game-phase.system';
import type { SerializedInteractionContext } from './game-interaction.system';
import type { AnyObject } from '@game/shared';
import { DeepDiffer } from './deep-differ';
import type { PatchBasedSnapshotDiff, EntityPatchMap } from './patch-types';
import type { SerializedBoard } from '../../board/board.system';
import type { SerializedCell } from '../../board/entities/board-cell.entity';
import type { SerializedArtifactCard } from '../../card/entities/artifact-card.entity';
import type { SerializedMinionCard } from '../../card/entities/minion-card.entity';
import type { SerializedSpellCard } from '../../card/entities/spell-card.entity';
import type { SerializedTile } from '../../tile/tile.entity';
import type { SerializedUnit } from '../../unit/unit.entity';
import { areArraysIdentical } from '../../utils/helpers';
import { INTERACTION_STATES } from '../game.enums';
import type { SerializedAbility } from '../../card/entities/ability.entity';

export type EntityDictionary = Record<
  string,
  | SerializedMinionCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedPlayer
  | SerializedModifier
  | SerializedCell
  | SerializedUnit
  | SerializedTile
  | SerializedAbility
>;

export type EntityDiffDictionary = Record<
  string,
  | Partial<SerializedMinionCard>
  | Partial<SerializedSpellCard>
  | Partial<SerializedArtifactCard>
  | Partial<SerializedPlayer>
  | Partial<SerializedModifier>
  | Partial<SerializedCell>
  | Partial<SerializedUnit>
  | Partial<SerializedTile>
  | Partial<SerializedAbility>
>;

export type SerializedOmniscientState = {
  entities: EntityDictionary;
  config: Config;
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: SerializedBoard;
  turnCount: number;
  turnPlayer: string;
  players: string[];
  tiles: string[];
  units: string[];
};

export type SnapshotDiff = {
  config: Partial<Config>;
  entities: EntityDiffDictionary;
  addedEntities: string[];
  removedEntities: string[];
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: Partial<SerializedBoard>;
  turnCount: number;
  turnPlayer: string;
  players: string[];
  tiles: string[];
  units: string[];
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

  private getObjectDiff<T extends AnyObject>(obj: T, prevObj: T | undefined): Partial<T> {
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
  ): PatchBasedSnapshotDiff {
    const entityPatches: EntityPatchMap = {};
    const addedEntities: Record<string, any> = {};
    const removedEntityIds: string[] = [];

    for (const [id, entity] of Object.entries(state.entities)) {
      if (!(id in prevState.entities)) {
        addedEntities[id] = entity;
      }
    }

    for (const id in prevState.entities) {
      if (!(id in state.entities)) {
        removedEntityIds.push(id);
      }
    }

    for (const [id, entity] of Object.entries(state.entities)) {
      if (id in prevState.entities) {
        const patches = this.deepDiffer.generatePatches(entity, prevState.entities[id]);

        if (patches.length > 0) {
          entityPatches[id] = patches;
        }
      }
    }

    return {
      entityPatches,
      addedEntities,
      removedEntities: removedEntityIds,
      config: this.getObjectDiff(state.config, prevState.config),
      phase: state.phase,
      interaction: state.interaction,
      board: this.getObjectDiff(state.board, prevState.board),
      turnCount: state.turnCount - prevState.turnCount,
      turnPlayer: state.turnPlayer,
      players: state.players,
      tiles: state.tiles,
      units: state.units
    };
  }

  private buildEntityDictionary(): EntityDictionary {
    const entities: EntityDictionary = {};
    this.game.cardSystem.cards.forEach(card => {
      entities[card.id] = card.serialize();
      card.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    this.game.playerSystem.players.forEach(player => {
      entities[player.id] = player.serialize();
      player.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    this.game.boardSystem.cells.forEach(cell => {
      entities[cell.id] = cell.serialize();
    });
    this.game.unitSystem.units.forEach(unit => {
      entities[unit.id] = unit.serialize();
      unit.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    this.game.tileSystem.tiles.forEach(tile => {
      entities[tile.id] = tile.serialize();
    });
    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary(),
      phase: this.game.gamePhaseSystem.serialize(),
      interaction: this.game.interaction.serialize(),
      board: this.game.boardSystem.serialize(),
      units: this.game.unitSystem.units.map(unit => unit.id),
      players: this.game.playerSystem.players.map(player => player.id),
      tiles: this.game.tileSystem.tiles.map(tile => tile.id),
      turnPlayer: this.game.turnSystem.initiativePlayer.id,
      turnCount: this.game.turnSystem.elapsedTurns
    };
  }

  serializePlayerState(
    playerId: string,
    eventsSinceLastSnapshot: GameStarEvent[]
  ): SerializedPlayerState {
    const state = this.serializeOmniscientState();

    const hasBeenPlayed = (cardId: string) => {
      if (state.interaction.ctx.player === playerId) {
        // add card from choices since they could come from a hidden source (like deck or opponent's hand)
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
      if (card.location === 'board' || card.location === 'discardPile') {
        return;
      }
      if (this.seenCardsByPlayer[playerId].has(card.id)) {
        return;
      }
      const seen = hasBeenPlayed(card.id);

      if (seen) {
        this.seenCardsByPlayer[playerId].add(card.id);
        return;
      }

      cardsToRemove.push(card.id);
    });

    cardsToRemove.forEach(cardId => {
      const card = this.game.cardSystem.getCardById(cardId)!;

      card.modifiers.list.forEach(modifier => {
        delete state.entities[modifier.id];
      });

      delete state.entities[cardId];
    });

    return state;
  }
}
