import { UseCase } from '../../usecase';
import { MatchmakingRepository } from '../repositories/matchmaking.repository';

export type RunMatchmakingInput = {
  name: string;
};
export interface RunMatchmakingOutput {
  success: true;
}

export type RunMatchmakingCtx = {
  matchmakingRepo: MatchmakingRepository;
};
export class RunMatchmakingUseCase extends UseCase<
  RunMatchmakingInput,
  RunMatchmakingOutput,
  RunMatchmakingCtx
> {
  get matchmakingRepo() {
    return this.ctx.matchmakingRepo;
  }

  async execute(input: RunMatchmakingInput): Promise<RunMatchmakingOutput> {
    return { success: true };
  }
}
