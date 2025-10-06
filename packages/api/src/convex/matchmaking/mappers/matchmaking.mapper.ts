import type { BetterOmit } from '@game/shared';
import type { Matchmaking, MatchmakingDoc } from '../entities/matchmaking.entity';

export class MatchmakingMapper {
  static INJECTION_KEY = 'matchmakingMapper' as const;

  toPersistence(matchmaking: Matchmaking): BetterOmit<MatchmakingDoc, '_creationTime'> {
    return {
      _id: matchmaking.id,
      name: matchmaking.name,
      description: matchmaking.description,
      enabled: matchmaking.enabled,
      nextInvocationId: matchmaking.nextInvocationId
    };
  }
}
