import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { AuthEventMap } from '../auth/auth.events';
import type { MatchmakingEventMap } from '../matchmaking/matchmaking.event';

type EventMap = AuthEventMap & MatchmakingEventMap;

export type EventEmitter = TypedEventEmitter<EventMap>;
export const eventEmitter = new TypedEventEmitter<EventMap>('parallel');
