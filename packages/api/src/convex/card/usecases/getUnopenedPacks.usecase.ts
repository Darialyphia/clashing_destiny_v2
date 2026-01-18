import type { UseCase } from '../../usecase';
import type { AuthSession } from '../../auth/entities/session.entity';
import { ensureAuthenticated } from '../../auth/auth.utils';
import type { BoosterPackReadRepository } from '../repositories/booster-pack-read.repository';
import type { BoosterPackId } from '../entities/booster-pack.entity';
import { BOOSTER_PACKS_CATALOG } from '../card.constants';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetUnopenedPacksInput {}

export interface GetUnopenedPacksOutput {
  packs: Array<{
    packId: BoosterPackId;
    packType: string;
    packName: string;
    acquiredAt: number;
  }>;
}

export class GetUnopenedPacksUseCase
  implements UseCase<GetUnopenedPacksInput, GetUnopenedPacksOutput>
{
  static INJECTION_KEY = 'getUnopenedPacksUseCase' as const;

  constructor(
    protected ctx: {
      session: AuthSession | null;
      boosterPackReadRepo: BoosterPackReadRepository;
    }
  ) {}

  async execute(): Promise<GetUnopenedPacksOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const pendingPacks = await this.ctx.boosterPackReadRepo.getPendingByOwnerId(
      session.userId
    );

    const packs = pendingPacks.map(pack => {
      const packConfig =
        BOOSTER_PACKS_CATALOG[pack.packType as keyof typeof BOOSTER_PACKS_CATALOG];

      return {
        packId: pack._id,
        packType: pack.packType,
        packName: packConfig?.name ?? 'Unknown Pack',
        acquiredAt: pack.acquiredAt
      };
    });

    return { packs };
  }
}
