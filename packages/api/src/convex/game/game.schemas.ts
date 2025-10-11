import { defineTable } from 'convex/server';
import { v, type Validator } from 'convex/values';
import { GAME_STATUS, type GameStatus } from './game.constants';

export const gamestatusValidator = v.union(
  v.literal(GAME_STATUS.CANCELLED),
  v.literal(GAME_STATUS.FINISHED),
  v.literal(GAME_STATUS.ONGOING),
  v.literal(GAME_STATUS.WAITING_FOR_PLAYERS)
) as Validator<GameStatus>;

export const gameSchemas = {
  games: defineTable({
    seed: v.string(),
    status: gamestatusValidator,
    winnerId: v.optional(v.union(v.id('users'), v.null())),
    cancellationId: v.optional(v.id('_scheduled_functions')),
    options: v.object({
      disableTurnTimers: v.boolean(),
      teachingMode: v.boolean()
    })
  }).index('by_status', ['status']),

  gamePlayers: defineTable({
    userId: v.id('users'),
    deckId: v.id('decks'),
    gameId: v.id('games')
  })
    .index('by_user_id', ['userId'])
    .index('by_game_id', ['gameId'])
};
