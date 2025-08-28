import { internal } from '../../_generated/api';
import type { MutationCtx } from '../../_generated/server';
import { UseCase } from '../../usecase';
import { DomainError } from '../../utils/error';
import { MATCHMAKING_SCHEDULER_INTERVAL_MS } from '../matchmaking.constants';
import { MatchmakingRepository } from '../repositories/matchmaking.repository';

export type RunMatchmakingInput = {
  name: string;
};
export interface RunMatchmakingOutput {
  success: true;
}

export type RunMatchmakingCtx = {
  matchmakingRepo: MatchmakingRepository;
  scheduler: MutationCtx['scheduler'];
};
export class RunMatchmakingUseCase extends UseCase<
  RunMatchmakingInput,
  RunMatchmakingOutput,
  RunMatchmakingCtx
> {
  get matchmakingRepo() {
    return this.ctx.matchmakingRepo;
  }

  get scheduler() {
    return this.ctx.scheduler;
  }

  async execute(input: RunMatchmakingInput): Promise<RunMatchmakingOutput> {
    const matchmaking = await this.matchmakingRepo.getByName(input.name);
    if (!matchmaking) {
      throw new DomainError('Matchmaking not found');
    }

    const { pairs, remaining } = matchmaking.matchParticipants();

    const nextInvocationId =
      remaining.length > 1
        ? await this.scheduler.runAfter(
            MATCHMAKING_SCHEDULER_INTERVAL_MS,
            internal.matchmaking.matchPlayers
          )
        : undefined;

    if (nextInvocationId) {
      matchmaking.scheduleRun(nextInvocationId);
    } else {
      matchmaking.stopRunning();
    }

    await this.matchmakingRepo.save(matchmaking);

    return { success: true };
  }
}
