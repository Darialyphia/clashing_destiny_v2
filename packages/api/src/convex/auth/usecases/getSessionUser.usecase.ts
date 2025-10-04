import { QueryUseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import { Email } from '../../utils/email';
import { AppError } from '../../utils/error';
import { Password } from '../../utils/password';
import type { SessionId } from '../entities/session.entity';

export interface LoginInput {
  email: Email;
  password: Password;
}

export interface GetSessionUserput {
  sessionId: SessionId;
  id: UserId;
  username: string;
  mmr: number;
}

export class GetSessionUserUseCase extends QueryUseCase<never, GetSessionUserput> {
  static INJECTION_KEY = 'getSessionUserUseCase' as const;

  async execute() {
    const user = await this.ctx.userReadRepo.getById(this.ctx.session!.userId);
    if (!user) throw new AppError('User not found');

    return {
      sessionId: this.ctx.session!._id,
      id: user._id,
      username: user.username,
      mmr: user.mmr
    };
  }
}
