import type { UserId } from '../../users/entities/user.entity';

export class AccountCreatedEvent {
  static EVENT_NAME = 'accountCreated' as const;

  constructor(readonly userId: UserId) {}
}
