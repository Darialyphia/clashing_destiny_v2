import { MutationUseCase } from '../../usecase';
import { DomainError } from '../../utils/error';

export type LeaveMatchmakingInput = never;

export interface LeaveMatchmakingOutput {
  success: true;
}

export class LeaveMatchmakingUseCase extends MutationUseCase<
  LeaveMatchmakingInput,
  LeaveMatchmakingOutput
> {
  static INJECTION_KEY = 'leaveMatchmakingUseCase' as const;

  async execute(): Promise<LeaveMatchmakingOutput> {
    const matchmaking = await this.ctx.matchmakingRepo.getByUserId(
      this.ctx.session.userId
    );

    if (!matchmaking) {
      throw new DomainError('User is not in matchmaking');
    }

    matchmaking.leave(this.ctx.session.userId);
    await this.ctx.matchmakingRepo.save(matchmaking);

    return { success: true };
  }
}
