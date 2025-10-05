import { MutationUseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { Deck } from '../entities/deck.entity';
import { AppError } from '../../utils/error';

export interface GrantPremadeDeckInput {
  userId: UserId;
  premadeDeckId: string;
}

export interface GrantPremadeDeckOutput {
  success: boolean;
}

export class GrantPremadeDeckUseCase extends MutationUseCase<
  GrantPremadeDeckInput,
  GrantPremadeDeckOutput
> {
  static INJECTION_KEY = 'grantPremadeDeckUseCase' as const;

  async execute(input: GrantPremadeDeckInput) {
    await this.ctx.deckRepo.grantPremadeDeckToUser(input.premadeDeckId, input.userId);

    return { success: true };
  }
}
