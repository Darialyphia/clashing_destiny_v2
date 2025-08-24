import { UseCase } from '../../usecase';
import { deleteSession } from '../repositories/session.repository';
import { ensureAuthenticated, MutationCtxWithSession } from '../auth.utils';

export interface LogoutOutput {
  success: true;
}

export class LogoutUseCase extends UseCase<never, LogoutOutput, MutationCtxWithSession> {
  async execute(): Promise<LogoutOutput> {
    const session = ensureAuthenticated(this.ctx.session);
    await deleteSession(this.ctx, session._id);

    return { success: true };
  }
}
