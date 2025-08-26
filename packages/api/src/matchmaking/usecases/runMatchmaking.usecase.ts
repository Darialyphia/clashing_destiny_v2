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
    // Basic matchmaking info (no participants loaded)
    const matchmaking = await this.matchmakingRepo.getByName(input.name);

    if (!matchmaking) {
      throw new Error('Matchmaking not found');
    }

    // If we need participants for business logic, load them explicitly
    const matchmakingWithParticipants = await this.matchmakingRepo.getByName(input.name, {
      include: { participants: true }
    });

    // Now we can safely call methods that require participants
    const participantCount = matchmakingWithParticipants?.getParticipantCount() ?? 0;
    console.log(`Matchmaking ${input.name} has ${participantCount} participants`);

    return { success: true };
  }
}
