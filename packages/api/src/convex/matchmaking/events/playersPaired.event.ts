import type { MMRMatchmakingParticipant } from '@game/engine/src/matchmaking/strategies/mmr.strategy';
import type { MatchmakingUser } from '../entities/matchmakingUser.entity';

export class PlayersPairedEvent {
  static EVENT_NAME = 'playersPaired' as const;

  constructor(
    readonly pairs: [
      MMRMatchmakingParticipant<MatchmakingUser>,
      MMRMatchmakingParticipant<MatchmakingUser>
    ][]
  ) {}
}
