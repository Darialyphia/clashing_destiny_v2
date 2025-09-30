import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { DeckId } from '../../deck/entities/deck.entity';
import type { UserId } from '../../users/entities/user.entity';
import { UserRepository } from '../../users/repositories/user.repository';
import { Game, type GameDoc, type GameId } from '../entities/game.entity';
import { GamePlayer } from '../entities/gamePlayer.entity';
import { GAME_STATUS } from '../game.constants';
import { GamePlayerReadRepository, GamePlayerRepository } from './gamePlayer.repository';

export class GameReadRepository {
  static INJECTION_KEY = 'gameReadRepo';

  declare protected db: DatabaseReader;
  declare protected gamePlayerRepo: GamePlayerReadRepository;

  constructor(config: { db: DatabaseReader; gamePlayerRepo: GamePlayerReadRepository }) {
    this.db = config.db;
    this.gamePlayerRepo = config.gamePlayerRepo;
  }

  async getById(gameId: GameId) {
    return this.db.get(gameId);
  }

  async getByUserId(userId: UserId) {
    const gamePlayer = await this.gamePlayerRepo.byUserId(userId);
    if (!gamePlayer) return null;

    return this.db.get(gamePlayer.gameId);
  }
}

export class GameRepository {
  static INJECTION_KEY: 'gameRepo';

  declare protected db: DatabaseWriter;
  declare protected userRepo: UserRepository;
  declare protected gamePlayerRepo: GamePlayerRepository;

  constructor(config: {
    db: DatabaseWriter;
    userRepo: UserRepository;
    gamePlayerRepo: GamePlayerRepository;
  }) {
    this.db = config.db;
    this.userRepo = config.userRepo;
    this.gamePlayerRepo = config.gamePlayerRepo;
  }

  private async buildEntity(doc: GameDoc) {
    const players = await this.gamePlayerRepo.byGameId(doc._id);

    return new Game(doc._id, { game: doc, players });
  }

  async getById(gameId: GameId) {
    const doc = await this.db.get(gameId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async byUserId(userId: UserId) {
    const gamePlayer = await this.gamePlayerRepo.byUserId(userId);
    if (!gamePlayer) return null;

    const gameDoc = await this.db.get(gamePlayer.gameId);
    if (!gameDoc) return null;

    return this.buildEntity(gameDoc);
  }

  async create(players: Array<{ userId: UserId; deckId: DeckId }>) {
    const gameId = await this.db.insert('games', {
      seed: `${Date.now()}`,
      status: GAME_STATUS.WAITING_FOR_PLAYERS
    });

    for (const player of players) {
      await this.gamePlayerRepo.create({
        deckId: player.deckId,
        userId: player.userId,
        gameId: gameId
      });
    }
  }

  async save(gamePlayer: GamePlayer) {
    await this.db.replace(gamePlayer.id, {
      gameId: gamePlayer.gameId,
      userId: gamePlayer.userId,
      deckId: gamePlayer.deckId
    });
  }
}
