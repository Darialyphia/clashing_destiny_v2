import { MutationUseCase } from '../../usecase';
import { DomainError } from '../../utils/error';

export type RunMatchmakingInput = {
  name: string;
};
export interface RunMatchmakingOutput {
  success: true;
}

export class RunMatchmakingUseCase extends MutationUseCase<
  RunMatchmakingInput,
  RunMatchmakingOutput
> {
  static INJECTION_KEY = 'runMatchmakingUseCase' as const;

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

    return { success: true };
  }
}
