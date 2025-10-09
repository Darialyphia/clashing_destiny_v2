import type { BetterOmit } from '@game/shared';
import { Lobby, type LobbyDoc } from '../entities/lobby.entity';

export class LobbyMapper {
  static INJECTION_KEY = 'lobbyMapper' as const;

  toPersistence(lobby: Lobby): BetterOmit<LobbyDoc, '_creationTime'> {
    return {
      _id: lobby.id,
      name: lobby.name,
      ownerId: lobby.ownerId,
      gameId: lobby.gameId,
      password: lobby.password,
      status: lobby.status,
      messages: lobby.messages,
      options: lobby.options
    };
  }
}
