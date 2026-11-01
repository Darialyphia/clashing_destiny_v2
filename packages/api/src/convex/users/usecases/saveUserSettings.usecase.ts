import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { UserSettingsRepository } from '../repositories/userSettings.repository';

// Settings are stored as an untyped blob, this is just a guard against abuse
const MAX_SETTINGS_SIZE = 32_000;

export type SaveUserSettingsInput = {
  version: number;
  settings: Record<string, unknown>;
};

export type SaveUserSettingsOutput = {
  success: boolean;
};

export class SaveUserSettingsUseCase
  implements UseCase<SaveUserSettingsInput, SaveUserSettingsOutput>
{
  static INJECTION_KEY = 'saveUserSettingsUseCase' as const;

  constructor(
    private ctx: {
      userSettingsRepo: UserSettingsRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: SaveUserSettingsInput): Promise<SaveUserSettingsOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    if (JSON.stringify(input.settings).length > MAX_SETTINGS_SIZE) {
      throw new AppError('Settings are too large');
    }

    await this.ctx.userSettingsRepo.upsert({
      userId: session.userId,
      settings: input.settings,
      version: input.version
    });

    return { success: true };
  }
}
