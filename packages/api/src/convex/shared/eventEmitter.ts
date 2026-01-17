import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { AuthEventMap } from '../auth/auth.events';
import type { MatchmakingEventMap } from '../matchmaking/matchmaking.event';
import type { FriendEventMap } from '../friend/friend.events';
import type { LobbyEventMap } from '../lobby/lobby.events';
import type { GameEventMap } from '../game/game.events';
import type { CurrencyEventMap } from '../currency/currency.events';

type EventMap = AuthEventMap &
  MatchmakingEventMap &
  FriendEventMap &
  LobbyEventMap &
  GameEventMap &
  CurrencyEventMap;

export type EventEmitter = TypedEventEmitter<EventMap>;
export const eventEmitter = new TypedEventEmitter<EventMap>('parallel');
