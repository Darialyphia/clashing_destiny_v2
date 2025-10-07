import type { UseCase } from '../../usecase';
import type { AuthSession } from '../entities/session.entity';
import type { SessionRepository } from '../repositories/session.repository';

export type LogoutInput = never;
export interface LogoutOutput {
  success: true;
}

export class LogoutUseCase implements UseCase<LogoutInput, LogoutOutput> {
  static INJECTION_KEY = 'logoutUseCase' as const;

  constructor(
    protected ctx: { sessionRepo: SessionRepository; session: AuthSession | null }
  ) {}

  async execute(): Promise<LogoutOutput> {
    if (this.ctx.session) {
      await this.ctx.sessionRepo.delete(this.ctx.session._id);
    }

    return { success: true };
  }
}
