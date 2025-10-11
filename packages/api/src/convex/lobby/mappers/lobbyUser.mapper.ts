import type { BetterOmit } from '@game/shared';
import { LobbyUser, type LobbyUserDoc } from '../entities/lobbyUser.entity';

export class LobbyUserMapper {
  static INJECTION_KEY = 'lobbyUserMapper' as const;

  toPersistence(lobbyUser: LobbyUser): BetterOmit<LobbyUserDoc, '_creationTime'> {
    return {
      _id: lobbyUser.id,
      userId: lobbyUser.userId,
      deckId: lobbyUser.deckId,
      lobbyId: lobbyUser.lobbyId,
      role: lobbyUser.role
    };
  }
}
