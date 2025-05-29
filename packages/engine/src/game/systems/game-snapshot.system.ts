import type { EmptyObject } from '@game/shared';
import { System } from '../../system';
import type { Config } from '../../config';
import {
  GAME_EVENTS,
  type GameStarEvent,
  type SerializedStarEvent
} from '../game.events';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.card';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { SerializedAttackCard } from '../../card/entities/attck.entity';
import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedLocationCard } from '../../card/entities/location.entity';
import type { SerializedTalentCard } from '../../card/entities/talent.entity';
import type { SerializedGamePhaseContext } from './game-phase.system';
import type { SerializedInteractionContext } from './game-interaction.system';
import type { SerializedBoard } from '../../board/board-side.entity';
import type { CardBeforePlayEvent, CardDiscardEvent } from '../../card/card.events';

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
  | SerializedAttackCard
  | SerializedArtifactCard
  | SerializedLocationCard
  | SerializedTalentCard
  | SerializedPlayer
  | SerializedModifier
>;

export type SerializedOmniscientState = {
  config: Config;
  entities: EntityDictionary;
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: SerializedBoard;
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
    this.game.on('*', event => {
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

    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary(),
      phase: this.game.gamePhaseSystem.serialize(),
      interaction: this.game.interaction.serialize(),
      board: this.game.boardSystem.serialize()
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
      if (!hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    opponent.cardManager.destinyDeck.cards.forEach(card => {
      if (!hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    opponent.cardManager.hand.forEach(card => {
      if (!hasBeenPlayed(card.id)) return;

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
  }
}
