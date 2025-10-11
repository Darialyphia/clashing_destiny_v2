import type { GameEndedEvent } from './events/gameEnded.event';

export type GameEventMap = {
  [GameEndedEvent.EVENT_NAME]: GameEndedEvent;
};
