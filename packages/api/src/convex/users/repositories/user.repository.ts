import type { Id } from '../../_generated/dataModel';
import { INITIAL_MMR } from '../../auth/auth.constants';
import { Email } from '../../utils/email';
import { Password } from '../../utils/password';
import { User } from '../entities/user.entity';
import { Username } from '../username';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import type { UserMapper } from '../mappers/user.mapper';

export class UserReadRepository {
  static INJECTION_KEY = 'userReadRepo' as const;

  constructor(private ctx: { db: DatabaseReader }) {}

  async getByEmail(email: Email) {
    return this.ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email.value))
      .unique();
  }

  async getById(userId: Id<'users'>) {
    return this.ctx.db.get(userId);
  }

  async getBySlug(slug: string) {
    return this.ctx.db
      .query('users')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .unique();
  }
}

export class UserRepository {
  static INJECTION_KEY = 'userRepo' as const;

  constructor(private ctx: { db: DatabaseWriter; userMapper: UserMapper }) {}

  async getByEmail(email: Email) {
    const doc = await this.ctx.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email.value))
      .unique();

    if (!doc) return null;

    return User.from(doc);
  }

  async getById(userId: Id<'users'>) {
    const doc = await this.ctx.db.get(userId);
    if (!doc) return null;

    return User.from(doc);
  }

  async getByUsername(username: Username) {
    const doc = await this.ctx.db
      .query('users')
      .withIndex('by_username', q => q.eq('username', username.value))
      .unique();

    if (!doc) return null;

    return User.from(doc);
  }

  async getBySlug(slug: string) {
    const doc = await this.ctx.db
      .query('users')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .unique();

    if (!doc) return null;

    return User.from(doc);
  }

  async create(input: { email: Email; password: Password; username: Username }) {
    return this.ctx.db.insert('users', {
      email: input.email.value,
      username: input.username.value,
      slug: input.username.toSlug(),
      passwordHash: await input.password.toHash(),
      mmr: INITIAL_MMR
    });
  }

  save(user: User) {
    return this.ctx.db.replace(user.id, this.ctx.userMapper.toPersistence(user));
  }
}
