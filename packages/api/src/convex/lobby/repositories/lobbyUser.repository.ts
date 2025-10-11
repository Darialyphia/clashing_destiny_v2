import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { Id } from '../../_generated/dataModel';
import type { UserId } from '../../users/entities/user.entity';
import {
  LobbyUser,
  type LobbyUserDoc,
  type LobbyUserId
} from '../entities/lobbyUser.entity';
import { LOBBY_USER_ROLES, type LobbyUserRole } from '../lobby.constants';
import type { LobbyUserMapper } from '../mappers/lobbyUser.mapper';

export class LobbyUserReadRepository {
  static INJECTION_KEY = 'lobbyUserReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getById(lobbyUserId: LobbyUserId) {
    return this.ctx.db.get(lobbyUserId);
  }

  async getByLobbyId(lobbyId: Id<'lobbies'>) {
    return this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', lobbyId))
      .collect();
  }

  async getByUserId(userId: UserId) {
    return this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .collect();
  }

  async getByLobbyAndUser(lobbyId: Id<'lobbies'>, userId: UserId) {
    return this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_user', q => q.eq('lobbyId', lobbyId).eq('userId', userId))
      .first();
  }

  async getPlayersByLobbyId(lobbyId: Id<'lobbies'>) {
    return this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', lobbyId))
      .filter(q => q.eq(q.field('role'), LOBBY_USER_ROLES.PLAYER))
      .collect();
  }

  async getSpectatorsByLobbyId(lobbyId: Id<'lobbies'>) {
    return this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', lobbyId))
      .filter(q => q.eq(q.field('role'), LOBBY_USER_ROLES.SPECTATOR))
      .collect();
  }
}

export class LobbyUserRepository {
  static INJECTION_KEY = 'lobbyUserRepo' as const;

  constructor(
    private ctx: {
      db: DatabaseWriter;
      lobbyUserMapper: LobbyUserMapper;
    }
  ) {}

  private buildEntity(doc: LobbyUserDoc) {
    return new LobbyUser(doc._id, doc);
  }

  async getById(lobbyUserId: LobbyUserId) {
    const doc = await this.ctx.db.get(lobbyUserId);

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async getByLobbyId(lobbyId: Id<'lobbies'>) {
    const docs = await this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', lobbyId))
      .collect();

    return docs.map(doc => this.buildEntity(doc));
  }

  async getByUserId(userId: UserId) {
    const docs = await this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .collect();

    return docs.map(doc => this.buildEntity(doc));
  }

  async getByLobbyAndUser(lobbyId: Id<'lobbies'>, userId: UserId) {
    const doc = await this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_user', q => q.eq('lobbyId', lobbyId).eq('userId', userId))
      .first();

    if (!doc) return null;

    return this.buildEntity(doc);
  }

  async getPlayersByLobbyId(lobbyId: Id<'lobbies'>) {
    const docs = await this.ctx.db
      .query('lobbyUsers')
      .withIndex('by_lobby_id', q => q.eq('lobbyId', lobbyId))
      .filter(q => q.eq(q.field('role'), LOBBY_USER_ROLES.PLAYER))
      .collect();

    return docs.map(doc => this.buildEntity(doc));
  }

  async create(data: {
    userId: UserId;
    lobbyId: Id<'lobbies'>;
    role: LobbyUserRole;
    deckId?: Id<'decks'>;
  }) {
    const lobbyUserId = await this.ctx.db.insert('lobbyUsers', {
      userId: data.userId,
      lobbyId: data.lobbyId,
      role: data.role,
      deckId: data.deckId
    });

    const lobbyUser = await this.getById(lobbyUserId);
    return lobbyUser!;
  }

  async save(lobbyUser: LobbyUser) {
    await this.ctx.db.patch(
      lobbyUser.id,
      this.ctx.lobbyUserMapper.toPersistence(lobbyUser)
    );
  }

  async delete(lobbyUserId: LobbyUserId) {
    await this.ctx.db.delete(lobbyUserId);
  }

  async deleteByLobbyId(lobbyId: Id<'lobbies'>) {
    const lobbyUsers = await this.getByLobbyId(lobbyId);

    for (const lobbyUser of lobbyUsers) {
      await this.ctx.db.delete(lobbyUser.id);
    }
  }

  async deleteByUserId(userId: UserId) {
    const lobbyUsers = await this.getByUserId(userId);

    for (const lobbyUser of lobbyUsers) {
      await this.ctx.db.delete(lobbyUser.id);
    }
  }
}
