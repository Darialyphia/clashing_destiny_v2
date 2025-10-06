import { api } from './convex/_generated/api';

export { api };
export type { SessionId } from './convex/auth/entities/session.entity';
export { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from './convex/auth/auth.constants';
export { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from './convex/users/username';
export type { DeckId } from './convex/deck/entities/deck.entity';
export type { CardId } from './convex/card/entities/card.entity';
export type { MatchmakingId } from './convex/matchmaking/entities/matchmaking.entity';
export type { UserId } from './convex/users/entities/user.entity';
export { GAME_STATUS, type GameStatus } from './convex/game/game.constants';
export type { GameId } from './convex/game/entities/game.entity';
