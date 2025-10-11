import type { LobbyGameStartedEvent } from './events/lobbyGameStarted.event';

export type LobbyEventMap = {
  [LobbyGameStartedEvent.EVENT_NAME]: LobbyGameStartedEvent;
};
