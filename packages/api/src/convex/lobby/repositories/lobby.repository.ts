import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import type { UserId } from '../../users/entities/user.entity';
import { Lobby, type LobbyDoc, type LobbyId } from '../entities/lobby.entity';
import { LOBBY_STATUS, LOBBY_USER_ROLES, type LobbyStatus } from '../lobby.constants';
import type { LobbyMapper } from '../mappers/lobby.mapper';
import type {
  LobbyUserReadRepository,
  LobbyUserRepository
} from './lobbyUser.repository';

export class LobbyReadRepository {
  static INJECTION_KEY = 'lobbyReadRepo' as const;

  constructor(
    private ctx: { db: DatabaseReader; lobbyUserReadRepo: LobbyUserReadRepository }
  ) {}

  async getById(lobbyId: LobbyId) {
    return this.ctx.db.get(lobbyId);
  }

  async getByOwnerId(ownerId: UserId) {
    return this.ctx.db
      .query('lobbies')
      .withIndex('by_owner_id', q => q.eq('ownerId', ownerId))
      .collect();
  }

  async getByGameId(gameId: Id<'games'>) {
    return this.ctx.db
      .query('lobbies')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .first();
  }

  async getByStatus(status: LobbyStatus) {
    return this.ctx.db
      .query('lobbies')
      .filter(q => q.eq(q.field('status'), status))
      .collect();
  }

  async getAvailableLobbies() {
    return this.ctx.db
      .query('lobbies')
      .filter(q => q.eq(q.field('status'), LOBBY_STATUS.WAITING_FOR_PLAYERS))
      .collect();
  }

  async getPublicLobbies() {
    return this.ctx.db
      .query('lobbies')
      .filter(q =>
        q.and(
          q.eq(q.field('status'), LOBBY_STATUS.WAITING_FOR_PLAYERS),
          q.eq(q.field('password'), undefined)
        )
      )
      .collect();
  }

  async getAll() {
    return this.ctx.db.query('lobbies').collect();
  }

  async getByUserId(userId: UserId) {
    const lobbyUsers = await this.ctx.lobbyUserReadRepo.getByUserId(userId);
    if (lobbyUsers.length === 0) return null;

    const lobbyUser = lobbyUsers[0];
    return this.getById(lobbyUser.lobbyId);
  }
}

export class LobbyRepository {
  static INJECTION_KEY = 'lobbyRepo' as const;

  constructor(
    private ctx: {
      db: DatabaseWriter;
      lobbyMapper: LobbyMapper;
      lobbyUserRepo: LobbyUserRepository;
    }
  ) {}

  private buildEntity(doc: LobbyDoc) {
    return new Lobby(doc._id, doc);
  }

  async getById(lobbyId: LobbyId) {
    const doc = await this.ctx.db.get(lobbyId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async getByOwnerId(ownerId: UserId) {
    const docs = await this.ctx.db
      .query('lobbies')
      .withIndex('by_owner_id', q => q.eq('ownerId', ownerId))
      .collect();

    return docs.map(doc => this.buildEntity(doc));
  }

  async create(data: {
    name: string;
    ownerId: UserId;
    password?: string;
    options: {
      disableTurnTimers: boolean;
      teachingMode: boolean;
    };
  }) {
    const lobbyId = await this.ctx.db.insert('lobbies', {
      name: data.name,
      ownerId: data.ownerId,
      password: data.password,
      status: LOBBY_STATUS.WAITING_FOR_PLAYERS,
      messages: [],
      options: data.options
    });

    const lobby = await this.getById(lobbyId);

    this.ctx.lobbyUserRepo.create({
      lobbyId,
      userId: data.ownerId,
      role: LOBBY_USER_ROLES.PLAYER
    });

    return lobby!;
  }

  async save(lobby: Lobby) {
    await this.ctx.db.patch(lobby.id, this.ctx.lobbyMapper.toPersistence(lobby));
  }

  async delete(lobbyId: LobbyId) {
    await this.ctx.db.delete(lobbyId);
    const lobbyUsers = await this.ctx.lobbyUserRepo.getByLobbyId(lobbyId);
    for (const lobbyUser of lobbyUsers) {
      await this.ctx.lobbyUserRepo.delete(lobbyUser.id);
    }
  }

  async getByGameId(gameId: Id<'games'>) {
    const doc = await this.ctx.db
      .query('lobbies')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .first();

    if (!doc) return null;

    return this.buildEntity(doc);
  }
}
