import { internal } from '../../_generated/api';
import type { DeckId } from '../../deck/entities/deck.entity';
import type { MutationContainer, QueryContainer } from '../../shared/container';
import type { UserId } from '../../users/entities/user.entity';
import { Game, type GameDoc, type GameId } from '../entities/game.entity';
import { GAME_STATUS, GAME_TIMEOUT_MS } from '../game.constants';

export class GameReadRepository {
  static INJECTION_KEY = 'gameReadRepo' as const;

  constructor(private ctx: QueryContainer) {}

  async getById(gameId: GameId) {
    return this.ctx.db.get(gameId);
  }

  async getByUserId(userId: UserId) {
    const gamePlayer = await this.ctx.gamePlayerReadRepo.byUserId(userId);
    if (!gamePlayer) return null;

    return this.ctx.db.get(gamePlayer.gameId);
  }
}

export class GameRepository {
  static INJECTION_KEY = 'gameRepo' as const;

  constructor(private ctx: MutationContainer) {}

  private async buildEntity(doc: GameDoc) {
    const players = await this.ctx.gamePlayerRepo.byGameId(doc._id);

    return new Game(doc._id, { game: doc, players });
  }

  async getById(gameId: GameId) {
    const doc = await this.ctx.db.get(gameId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async byUserId(userId: UserId) {
    const gamePlayer = await this.ctx.gamePlayerRepo.byUserId(userId);
    if (!gamePlayer) return null;

    const gameDoc = await this.ctx.db.get(gamePlayer.gameId);
    if (!gameDoc) return null;

    return this.buildEntity(gameDoc);
  }

  async create(players: Array<{ userId: UserId; deckId: DeckId }>) {
    const gameId = await this.ctx.db.insert('games', {
      seed: `${Date.now()}`,
      status: GAME_STATUS.WAITING_FOR_PLAYERS
    });

    for (const player of players) {
      await this.ctx.gamePlayerRepo.create({
        deckId: player.deckId,
        userId: player.userId,
        gameId: gameId
      });
    }

    return gameId;
  }

  async save(game: Game) {
    await this.ctx.db.patch(game.id, this.ctx.gameMapper.toPersistence(game));
  }

  async scheduleCancellation(game: Game) {
    const cancellationId = await this.ctx.scheduler.runAfter(
      GAME_TIMEOUT_MS,
      internal.games.cancel,
      { gameId: game.id }
    );

    game.scheduleCancellation(cancellationId);
  }
}
