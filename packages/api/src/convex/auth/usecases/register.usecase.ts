import { type UseCase } from '../../usecase';
import { Email } from '../../utils/email';
import { Password } from '../../utils/password';
import type { AuthSession } from '../entities/session.entity';
import { AppError } from '../../utils/error';
import { Username } from '../../users/username';
import type { UserRepository } from '../../users/repositories/user.repository';
import type { DeckRepository } from '../../deck/repositories/deck.repository';
import type { SessionRepository } from '../repositories/session.repository';
import type { EventEmitter } from '../../shared/eventEmitter';
import { AccountCreatedEvent } from '../events/accountCreated.event';

export interface RegisterInput {
  email: Email;
  username: Username;
  password: Password;
}

export interface RegisterOutput {
  session: AuthSession;
}

export class RegisterUseCase implements UseCase<RegisterInput, RegisterOutput> {
  static INJECTION_KEY = 'registerUseCase' as const;

  constructor(
    protected ctx: {
      userRepo: UserRepository;
      sessionRepo: SessionRepository;
      deckRepo: DeckRepository;
      eventEmitter: EventEmitter;
    }
  ) {}
  async validateEmail(email: Email) {
    const existing = await this.ctx.userRepo.getByEmail(email);
    if (existing) {
      throw new AppError('Email already in use');
    }
  }

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    await this.validateEmail(input.email);

    const userId = await this.ctx.userRepo.create({
      username: input.username,
      email: input.email,
      password: input.password
    });

    await this.ctx.eventEmitter.emit(
      AccountCreatedEvent.EVENT_NAME,
      new AccountCreatedEvent(userId)
    );

    const sessionId = await this.ctx.sessionRepo.create(userId);

    return { session: (await this.ctx.sessionRepo.getById(sessionId))! };
  }
}
