import { MutationUseCase } from '../../usecase';
import { Email } from '../../utils/email';
import { Password } from '../../utils/password';
import type { AuthSession } from '../entities/session.entity';
import { AppError } from '../../utils/error';

export interface RegisterInput {
  email: Email;
  password: Password;
}

export interface RegisterOutput {
  session: AuthSession;
}

export class RegisterUseCase extends MutationUseCase<RegisterInput, RegisterOutput> {
  static INJECTION_KEY = 'registerUseCase' as const;

  async validateEmail(email: Email) {
    const existing = await this.ctx.userRepo.getByEmail(email);
    if (existing) {
      throw new AppError('Email already in use');
    }
  }

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    await this.validateEmail(input.email);

    const userId = await this.ctx.userRepo.create({
      email: input.email,
      password: input.password
    });

    const sessionId = await this.ctx.sessionRepo.create(userId);

    return { session: (await this.ctx.sessionRepo.getById(sessionId))! };
  }
}
