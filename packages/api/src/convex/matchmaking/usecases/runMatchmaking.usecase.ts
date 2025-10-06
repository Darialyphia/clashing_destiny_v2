import type { GameRepository } from '../../game/repositories/game.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { type UseCase } from '../../usecase';
import { DomainError } from '../../utils/error';
import { PlayersPairedEvent } from '../events/playersPaired.event';
import type { MatchmakingRepository } from '../repositories/matchmaking.repository';

export type RunMatchmakingInput = {
  name: string;
};
export interface RunMatchmakingOutput {
  success: true;
}

export class RunMatchmakingUseCase
  implements UseCase<RunMatchmakingInput, RunMatchmakingOutput>
{
  static INJECTION_KEY = 'runMatchmakingUseCase' as const;

  constructor(
    private ctx: {
      matchmakingRepo: MatchmakingRepository;
      gameRepo: GameRepository;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(input: RunMatchmakingInput): Promise<RunMatchmakingOutput> {
    const matchmaking = await this.ctx.matchmakingRepo.getByName(input.name);
    if (!matchmaking) {
      throw new DomainError('Matchmaking not found');
    }

    const { pairs, remaining } = matchmaking.matchParticipants();

    if (remaining.length) {
      await this.ctx.matchmakingRepo.scheduleRun(matchmaking);
    } else {
      matchmaking.stopRunning();
    }

    await this.ctx.matchmakingRepo.save(matchmaking);

    this.ctx.eventEmitter.emit(
      PlayersPairedEvent.EVENT_NAME,
      new PlayersPairedEvent(pairs)
    );

    return { success: true };
  }
}
