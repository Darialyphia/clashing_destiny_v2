import { MutationUseCase } from '../../usecase';
import { Email } from '../../utils/email';
import { AppError } from '../../utils/error';
import { Password } from '../../utils/password';
import type { AuthSession } from '../entities/session.entity';

export interface LoginInput {
  email: Email;
  password: Password;
}

export interface LoginOutput {
  session: AuthSession;
}

export class LoginUseCase extends MutationUseCase<LoginInput, LoginOutput> {
  static INJECTION_KEY = 'loginUseCase' as const;

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.ctx.userRepo.getByEmail(input.email);

    // Avoid user-enumeration timing leaks by doing a fake hash compare on miss
    const hash = user?.passwordHash ?? (await new Password('dummy').toHash());

    const ok = await input.password.verify(hash);
    if (!user || !ok) throw new AppError('Invalid credentials');

    const sessionId = await this.ctx.sessionRepo.create(user.id);

    return { session: (await this.ctx.sessionRepo.getById(sessionId))! };
  }
}
