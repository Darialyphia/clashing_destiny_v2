import type { UserId } from '../users/entities/user.entity';
import { GameRepository } from './repositories/game.repository';

export const ensureHasNoCurrentGame = async (
  gameRepo: GameRepository,
  userId: UserId
) => {
  const game = await gameRepo.byUserId(userId);
  if (!game) return;
  if (game.status !== 'FINISHED' && game.status !== 'CANCELLED') {
    throw new Error('Already in game');
  }
};
