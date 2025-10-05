import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { AuthEventMap } from '../auth/auth.events';

type EventMap = AuthEventMap;

export type EventEmitter = TypedEventEmitter<EventMap>;
export const eventEmitter = new TypedEventEmitter<EventMap>('parallel');
