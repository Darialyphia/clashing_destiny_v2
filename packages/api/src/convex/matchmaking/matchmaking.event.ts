import type { PlayersPairedEvent } from './events/playersPaired.event';

export type MatchmakingEventMap = {
  [PlayersPairedEvent.EVENT_NAME]: PlayersPairedEvent;
};
