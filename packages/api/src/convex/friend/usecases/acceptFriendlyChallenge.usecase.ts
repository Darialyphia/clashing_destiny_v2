import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { EventEmitter } from '../../shared/eventEmitter';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { FriendlyChallengeId } from '../entities/friendlyChallenge.entity';
import { FriendlyChallengeAcceptedEvent } from '../events/friendlyChallengeAccepted.event';
import type { FriendlyChallengeRepository } from '../repositories/friendlyChallenge.repository';

export type AcceptFriendlyChallengeInput = {
  challengeId: FriendlyChallengeId;
};

export type AcceptFriendlyChallengeOutput = {
  success: boolean;
};

export class AcceptFriendlyChallengeUseCase
  implements UseCase<AcceptFriendlyChallengeInput, AcceptFriendlyChallengeOutput>
{
  static INJECTION_KEY = 'acceptFriendlyChallengeUseCase' as const;

  constructor(
    private ctx: {
      friendlyChallengeRepo: FriendlyChallengeRepository;
      session: AuthSession | null;
      eventEmitter: EventEmitter;
    }
  ) {}

  async execute(
    input: AcceptFriendlyChallengeInput
  ): Promise<AcceptFriendlyChallengeOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const friendlyChallenge = await this.ctx.friendlyChallengeRepo.getById(
      input.challengeId
    );
    if (!friendlyChallenge) {
      throw new AppError('Friendly challenge not found');
    }

    if (!friendlyChallenge.canAccept(session.userId)) {
      throw new AppError('You are not authorized to accept this friendly challenge');
    }

    friendlyChallenge.accept();
    await this.ctx.friendlyChallengeRepo.save(friendlyChallenge);

    this.ctx.eventEmitter.emit(
      FriendlyChallengeAcceptedEvent.EVENT_NAME,
      new FriendlyChallengeAcceptedEvent(friendlyChallenge)
    );

    return { success: true };
  }
}
