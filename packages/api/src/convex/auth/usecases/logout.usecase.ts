import type { EmptyObject } from '@game/shared';
import { MutationUseCase } from '../../usecase';

export type LogoutInput = never;
export interface LogoutOutput {
  success: true;
}

export class LogoutUseCase extends MutationUseCase<LogoutInput, LogoutOutput> {
  static INJECTION_KEY = 'logoutUseCase' as const;

  async execute(): Promise<LogoutOutput> {
    await this.ctx.sessionRepo.delete(this.ctx.session._id);
    return { success: true };
  }
}
