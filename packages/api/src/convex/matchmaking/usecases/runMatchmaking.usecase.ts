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
    await Promise.all(
      pairs.map(async pair => {
        const gameId = await this.ctx.gameRepo.create(pair.map(p => p.meta));
        const game = await this.ctx.gameRepo.getById(gameId);
        await this.ctx.gameRepo.scheduleCancellation(game!);
        await this.ctx.gameRepo.save(game!);
      })
    );

    if (remaining.length) {
      await this.ctx.matchmakingRepo.scheduleRun(matchmaking);
    } else {
      matchmaking.stopRunning();
    }

    await this.ctx.matchmakingRepo.save(matchmaking);

    return { success: true };
  }
}
