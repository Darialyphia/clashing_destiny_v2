import type { User } from '../../users/entities/user.entity';

export class AccountCreatedEvent {
  static EVENT_NAME = 'accountCreated' as const;

  user: User;
  constructor(user: User) {
    this.user = user;
  }
}
