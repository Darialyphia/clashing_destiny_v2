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

export interface RegisterInput {
  email: Email;
  password: Password;
}

export interface RegisterOutput {
  session: AuthSession;
}

export class RegisterUseCase extends UseCase<RegisterInput, RegisterOutput, MutationCtx> {
  async execute(input: RegisterInput): Promise<RegisterOutput> {
    await this.validateEmail(input.email);

    const passwordHash = await input.password.toHash();

    const userId = await this.createUser(input.email, passwordHash);

    const sessionId = await createSession(this.ctx, userId);

    return { session: (await this.ctx.db.get(sessionId))! };
  }

  private async validateEmail(email: Email) {
    const existing = await getUserByEmail(this.ctx, email);
    if (existing) throw new AppError('Email already in use');
  }

  private async createUser(email: Email, passwordHash: string) {
    const userId = await this.ctx.db.insert('users', {
      email: email.value,
      passwordHash,
      name: DEFAULT_USERNAME,
      slug: slugify(DEFAULT_USERNAME),
      discriminator: await generateDiscriminator(this.ctx, DEFAULT_USERNAME)
    });
    return userId;
  }
}
