import { UseCase } from '../../usecase';
import { Email } from '../../utils/email';
import { Password } from '../../utils/password';
import { AuthSession } from '../entities/session.entity';
import type { MutationCtx } from '../../_generated/server';
import { createUserRepository, UserRepository } from '../../users/user.repository';
import {
  createSessionRepository,
  SessionRepository
} from '../repositories/session.repository';
import { RegisterValidator } from '../validators/register.validator';

export interface RegisterInput {
  email: Email;
  password: Password;
}

export interface RegisterOutput {
  session: AuthSession;
}

export type RegisterCtx = {
  userRepo: UserRepository;
  sessionRepo: SessionRepository;
};
export class RegisterUseCase extends UseCase<RegisterInput, RegisterOutput, RegisterCtx> {
  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const validator = new RegisterValidator(this.ctx.userRepo);

    await validator.validate(input);

    const userId = await this.ctx.userRepo.create({
      email: input.email,
      password: input.password
    });

    const sessionId = await this.ctx.sessionRepo.create(userId);

    return { session: (await this.ctx.sessionRepo.getById(sessionId))! };
  }
}
