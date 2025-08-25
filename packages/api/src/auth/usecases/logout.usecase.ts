import { Id } from '../../_generated/dataModel';
import { UseCase } from '../../usecase';
import { SessionRepository } from '../repositories/session.repository';

export type LogoutInput = {
  sessionId: Id<'authSessions'>;
};
export interface LogoutOutput {
  success: true;
}

export type LogoutCtx = {
  sessionRepo: SessionRepository;
};
export class LogoutUseCase extends UseCase<LogoutInput, LogoutOutput, LogoutCtx> {
  async execute(input: LogoutInput): Promise<LogoutOutput> {
    await this.ctx.sessionRepo.delete(input.sessionId);
    return { success: true };
  }
}
