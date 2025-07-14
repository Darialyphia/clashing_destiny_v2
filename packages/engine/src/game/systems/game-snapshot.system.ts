import type { EmptyObject } from '@game/shared';
import { System } from '../../system';
import type { Config } from '../../config';
import {
  GAME_EVENTS,
  GameNewSnapshotEvent,
  type GameEventName,
  type GameStarEvent,
  type SerializedStarEvent
} from '../game.events';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.card';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedGamePhaseContext } from './game-phase.system';
import type { SerializedInteractionContext } from './game-interaction.system';
import type { SerializedBoard } from '../../board/board-side.entity';
import type { CardBeforePlayEvent, CardDiscardEvent } from '../../card/card.events';
import type { SerializedEffectChain } from '../effect-chain';

export type GameStateSnapshot<T> = {
  id: number;
  state: T;
  events: SerializedStarEvent[];
};

export type EntityDictionary = Record<
  string,
  | SerializedMinionCard
  | SerializedHeroCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedPlayer
  | SerializedModifier
>;

export type SerializedOmniscientState = {
  config: Config;
  entities: EntityDictionary;
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  players: string[];
  board: SerializedBoard;
  turnPlayer: string;
  turnCount: number;
  effectChain: SerializedEffectChain | null;
};

export type SerializedPlayerState = SerializedOmniscientState;

export class GameSnaphotSystem extends System<EmptyObject> {
  private playerCaches: Record<string, GameStateSnapshot<SerializedPlayerState>[]> = {
    omniscient: []
  };
  private omniscientCache: GameStateSnapshot<SerializedOmniscientState>[] = [];

  private eventsSinceLastSnapshot: GameStarEvent[] = [];

  private nextId = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize(): void {
    const ignoredEvents: GameEventName[] = [
      GAME_EVENTS.NEW_SNAPSHOT,
      GAME_EVENTS.FLUSHED,
      GAME_EVENTS.INPUT_START,
      GAME_EVENTS.INPUT_END
    ];
    this.game.on('*', event => {
      if (ignoredEvents.includes(event.data.eventName)) return;
      this.eventsSinceLastSnapshot.push(event);
    });
    this.playerCaches[this.game.playerSystem.player1.id] = [];
    this.playerCaches[this.game.playerSystem.player2.id] = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  shutdown() {}

  getOmniscientSnapshotAt(index: number): GameStateSnapshot<SerializedOmniscientState> {
    const snapshot = this.omniscientCache[index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  geSnapshotForPlayerAt(
    playerId: string,
    index: number
  ): GameStateSnapshot<SerializedPlayerState> {
    const snapshot = this.playerCaches[playerId][index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  getLatestOmniscientSnapshot(): GameStateSnapshot<SerializedOmniscientState> {
    return this.getOmniscientSnapshotAt(this.nextId - 1);
  }

  getLatestSnapshotForPlayer(playerId: string): GameStateSnapshot<SerializedPlayerState> {
    return this.geSnapshotForPlayerAt(playerId, this.nextId - 1);
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
    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary(),
      phase: this.game.gamePhaseSystem.serialize(),
      interaction: this.game.interaction.serialize(),
      board: this.game.boardSystem.serialize(),
      players: this.game.playerSystem.players.map(player => player.id),
      turnPlayer: this.game.gamePhaseSystem.turnPlayer.id,
      turnCount: this.game.gamePhaseSystem.elapsedTurns,
      effectChain: this.game.effectChainSystem.serialize()
    };
  }

  serializePlayerState(playerId: string): SerializedPlayerState {
    const state = this.serializeOmniscientState();

    // Remove entities that the player shouldn't have access to in order to prevent cheating
    const opponent = this.game.playerSystem.getPlayerById(playerId)!.opponent;

    const hasBeenPlayed = (cardId: string) => {
      return this.eventsSinceLastSnapshot.some(e => {
        const event = e.data.event;
        if (
          e.data.eventName === GAME_EVENTS.CARD_BEFORE_PLAY &&
          (event as CardBeforePlayEvent).data.card.id === cardId
        ) {
          return true;
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
    opponent.cardManager.mainDeck.cards.forEach(card => {
      if (hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    opponent.cardManager.hand.forEach(card => {
      if (hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    return state;
  }

  takeSnapshot() {
    const events = this.eventsSinceLastSnapshot.map(event => event.serialize());
    const id = this.nextId++;
    this.playerCaches[this.game.playerSystem.player1.id].push({
      id,
      events: events as any,
      state: this.serializePlayerState(this.game.playerSystem.player1.id)
    });

    this.playerCaches[this.game.playerSystem.player2.id].push({
      id,
      events: events as any,
      state: this.serializePlayerState(this.game.playerSystem.player2.id)
    });

    this.omniscientCache.push({
      id,
      events: events as any,
      state: this.serializeOmniscientState()
    });

    this.eventsSinceLastSnapshot = [];
    void this.game.emit(GAME_EVENTS.NEW_SNAPSHOT, new GameNewSnapshotEvent({}));
  }
}
