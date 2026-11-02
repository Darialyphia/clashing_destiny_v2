import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { UserSettingsReadRepository } from '../repositories/userSettings.repository';

export type GetUserSettingsOutput = {
  version: number;
  settings: Record<string, unknown>;
} | null;

export class GetUserSettingsUseCase implements UseCase<never, GetUserSettingsOutput> {
  static INJECTION_KEY = 'getUserSettingsUseCase' as const;

  constructor(
    private ctx: {
      userSettingsReadRepo: UserSettingsReadRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(): Promise<GetUserSettingsOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const doc = await this.ctx.userSettingsReadRepo.getByUserId(session.userId);
    if (!doc) return null;

    return { version: doc.version, settings: doc.settings };
  }
}
