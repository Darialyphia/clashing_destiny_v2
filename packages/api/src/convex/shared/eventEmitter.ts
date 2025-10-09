import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { AuthEventMap } from '../auth/auth.events';
import type { MatchmakingEventMap } from '../matchmaking/matchmaking.event';
import type { FriendEventMap } from '../friend/friend.events';

type EventMap = AuthEventMap & MatchmakingEventMap & FriendEventMap;

export type EventEmitter = TypedEventEmitter<EventMap>;
export const eventEmitter = new TypedEventEmitter<EventMap>('parallel');
