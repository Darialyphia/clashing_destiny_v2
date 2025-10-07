import { type UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { DeckRepository } from '../repositories/deck.repository';

export interface GrantPremadeDeckInput {
  userId: UserId;
  premadeDeckId: string;
}

export interface GrantPremadeDeckOutput {
  success: boolean;
}

export class GrantPremadeDeckUseCase
  implements UseCase<GrantPremadeDeckInput, GrantPremadeDeckOutput>
{
  static INJECTION_KEY = 'grantPremadeDeckUseCase' as const;

  constructor(private ctx: { deckRepo: DeckRepository }) {}

  async execute(input: GrantPremadeDeckInput) {
    await this.ctx.deckRepo.grantPremadeDeckToUser(input.premadeDeckId, input.userId);

    return { success: true };
  }
}
