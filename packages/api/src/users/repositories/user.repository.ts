import type { Doc, Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { DEFAULT_USERNAME, INITIAL_MMR } from '../../auth/auth.constants';
import { generateDiscriminator } from '../../utils/discriminator';
import { Email } from '../../utils/email';
import slugify from 'slugify';
import { Password } from '../../utils/password';
import { AppError } from '../../utils/error';
import { User } from '../entities/user.entity';

interface UserQuery {
  include?: {
    currentMatchmaking?: boolean;
  };
}

export class UserReadRepository {
  constructor(protected db: DatabaseReader) {}

  private async buildUserEntity(userData: Doc<'users'>, query: UserQuery) {
    const currentMatchmakingUser = query.include?.currentMatchmaking
      ? await this.loadCurrentMatchmakingUser(userData._id)
      : undefined;

    return new User({
      ...userData,
      id: userData._id,
      currentMatchmakingUser: currentMatchmakingUser ?? undefined
    });
  }

  private loadCurrentMatchmakingUser(userId: Id<'users'>) {
    return this.db
      .query('matchmakingUsers')
      .withIndex('by_userId', q => q.eq('userId', userId))
      .unique();
  }

  async getByEmail(email: Email, query: UserQuery = {}) {
    const userData = await this.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email.value))
      .unique();

    if (!userData) return null;

    return this.buildUserEntity(userData, query);
  }

  async getById(userId: Id<'users'>, query: UserQuery = {}) {
    const userData = await this.db.get(userId);

    if (!userData) return null;

    return this.buildUserEntity(userData, query);
  }

  async getBySlug(slug: string, query: UserQuery = {}) {
    const userData = await this.db
      .query('users')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .unique();

    if (!userData) return null;

    return this.buildUserEntity(userData, query);
  }
}

export class UserRepository extends UserReadRepository {
  declare protected db: DatabaseWriter;

  constructor(db: DatabaseWriter) {
    super(db);
    this.db = db;
  }

  async create(input: { email: Email; password: Password; name?: string }) {
    const name = input.name || DEFAULT_USERNAME;
    const discriminator = await generateDiscriminator({ db: this.db }, name);

    return this.db.insert('users', {
      email: input.email.value,
      passwordHash: await input.password.toHash(),
      name,
      slug: slugify(`${name}--${discriminator}`),
      discriminator,
      mmr: INITIAL_MMR
    });
  }

  async updatePassword(userId: Id<'users'>, password: Password) {
    return this.db.patch(userId, { passwordHash: await password.toHash() });
  }

  async updateName(userId: Id<'users'>, name: string) {
    const user = await this.getById(userId);
    if (!user) throw new AppError('User not found');

    const slug = slugify(`${name}--${user.discriminator}`);
    const exists = await this.getBySlug(slug);

    if (exists) {
      const discriminator = await generateDiscriminator({ db: this.db }, name);
      const newSlug = slugify(`${name}--${discriminator}`);
      return this.db.patch(userId, { name, discriminator, slug: newSlug });
    } else {
      return this.db.patch(userId, { name, slug });
    }
  }

  async updateMmr(userId: Id<'users'>, mmr: number) {
    return this.db.patch(userId, { mmr });
  }
}

export const createUserReadRepository = (db: DatabaseReader) =>
  new UserReadRepository(db);

export const createUserRepository = (db: DatabaseWriter) => new UserRepository(db);
