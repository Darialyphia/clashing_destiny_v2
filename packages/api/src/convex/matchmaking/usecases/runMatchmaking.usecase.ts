import type { MutationCtx } from '../../_generated/server';
import { UseCase } from '../../usecase';
import { DomainError } from '../../utils/error';
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

    if (remaining.length) {
      await this.matchmakingRepo.scheduleRun(matchmaking);
    } else {
      matchmaking.stopRunning();
    }

    await this.matchmakingRepo.save(matchmaking);

    return { success: true };
  }
}
