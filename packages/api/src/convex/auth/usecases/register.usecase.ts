import { MutationUseCase } from '../../usecase';
import { Email } from '../../utils/email';
import { Password } from '../../utils/password';
import type { AuthSession } from '../entities/session.entity';
import { AppError } from '../../utils/error';
import { Username } from '../../users/username';
import { premadeDecks } from '../../deck/premadeDecks';
import type { UserId } from '../../users/entities/user.entity';

export interface RegisterInput {
  email: Email;
  username: Username;
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

  private async grantStarterDecks(userId: UserId): Promise<void> {
    const starterDecks = premadeDecks.filter(deck => deck.isGrantedOnAccountCreation);

    for (const deck of starterDecks) {
      await this.ctx.deckRepo.grantPremadeDeckToUser(deck.id, userId);
    }
  }

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    await this.validateEmail(input.email);

    const userId = await this.ctx.userRepo.create({
      username: input.username,
      email: input.email,
      password: input.password
    });

    await this.grantStarterDecks(userId);

    const sessionId = await this.ctx.sessionRepo.create(userId);

    return { session: (await this.ctx.sessionRepo.getById(sessionId))! };
  }
}
