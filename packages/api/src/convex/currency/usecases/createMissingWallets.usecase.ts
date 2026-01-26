import type { EmptyObject } from '@game/shared';
import type { UseCase } from '../../usecase';
import type { UserRepository } from '../../users/repositories/user.repository';
import type { WalletRepository } from '../repositories/wallet.repository';
import type { DatabaseWriter } from '../../_generated/server';

export type CreateMissingWalletsInput = EmptyObject;

export interface CreateMissingWalletsOutput {
  created: number;
  skipped: number;
  total: number;
}

export class CreateMissingWalletsUseCase
  implements UseCase<CreateMissingWalletsInput, CreateMissingWalletsOutput>
{
  static INJECTION_KEY = 'createMissingWalletsUseCase' as const;

  constructor(
    protected ctx: {
      userRepo: UserRepository;
      walletRepo: WalletRepository;
      db: DatabaseWriter;
    }
  ) {}

  async execute(): Promise<CreateMissingWalletsOutput> {
    const users = await this.ctx.db.query('users').collect();

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      const existingWallet = await this.ctx.walletRepo.getByUserId(user._id);

      if (existingWallet) {
        skipped++;
        continue;
      }

      await this.ctx.walletRepo.create(user._id);
      created++;
    }

    return {
      created,
      skipped,
      total: users.length
    };
  }
}
