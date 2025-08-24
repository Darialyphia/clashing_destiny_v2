import slugify from 'slugify';
import { UseCase } from '../../usecase';
import { Email } from '../../utils/email';
import { AppError } from '../../utils/error';
import { Password } from '../../utils/password';
import { DEFAULT_USERNAME } from '../auth.constants';
import { AuthSession } from '../entities/session.entity';
import { generateDiscriminator } from '../../utils/discriminator';
import { createSession } from '../repositories/session.repository';
import type { MutationCtx } from '../../_generated/server';
import { getUserByEmail } from '../../users/user.repository';

export interface LoginInput {
  email: Email;
  password: Password;
}

export interface LoginOutput {
  session: AuthSession;
}

export class LoginUseCase extends UseCase<LoginInput, LoginOutput, MutationCtx> {
  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await getUserByEmail(this.ctx, input.email);

    // Avoid user-enumeration timing leaks by doing a fake hash compare on miss
    const hash = user?.passwordHash ?? (await new Password('dummy').toHash());

    const ok = await input.password.verify(hash);
    if (!user || !ok) throw new AppError('Invalid credentials');

    const sessionId = await createSession(this.ctx, user._id);

    return { session: (await this.ctx.db.get(sessionId))! };
  }
}
