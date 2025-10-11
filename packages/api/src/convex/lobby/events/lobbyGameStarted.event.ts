import type { LobbyId } from '../entities/lobby.entity';

export class LobbyGameStartedEvent {
  static EVENT_NAME = 'lobbyGameStarted' as const;

  constructor(readonly lobbyId: LobbyId) {}
}
