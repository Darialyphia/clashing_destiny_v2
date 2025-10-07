import type { BetterOmit } from '@game/shared';
import type { User, UserDoc } from '../entities/user.entity';

export class UserMapper {
  static INJECTION_KEY = 'userMapper' as const;

  toPersistence(user: User): BetterOmit<UserDoc, '_creationTime'> {
    return {
      _id: user.id,
      email: user.email.value,
      username: user.username.value,
      passwordHash: user.passwordHash,
      slug: user.slug,
      mmr: user.mmr
    };
  }
}
