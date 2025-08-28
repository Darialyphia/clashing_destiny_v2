import type { Id } from '../../_generated/dataModel';
import type { DatabaseReader, DatabaseWriter } from '../../_generated/server';
import { DEFAULT_USERNAME, INITIAL_MMR } from '../../auth/auth.constants';
import { generateDiscriminator } from '../../utils/discriminator';
import { Email } from '../../utils/email';
import slugify from 'slugify';
import { Password } from '../../utils/password';
import { AppError } from '../../utils/error';
import { User } from '../entities/user.entity';

export class UserReadRepository {
  constructor(protected db: DatabaseReader) {}

  async getByEmail(email: Email) {
    return this.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email.value))
      .unique();
  }

  async getById(userId: Id<'users'>) {
    return this.db.get(userId);
  }

  async getBySlug(slug: string) {
    return this.db
      .query('users')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .unique();
  }
}

export class UserRepository {
  declare protected db: DatabaseWriter;

  constructor(db: DatabaseWriter) {
    this.db = db;
  }

  async getByEmail(email: Email) {
    const doc = await this.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email.value))
      .unique();

    if (!doc) return null;

    return new User(doc._id, doc);
  }

  async getById(userId: Id<'users'>) {
    const doc = await this.db.get(userId);
    if (!doc) return null;

    return new User(doc._id, doc);
  }

  async getBySlug(slug: string) {
    const doc = await this.db
      .query('users')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .unique();

    if (!doc) return null;

    return new User(doc._id, doc);
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

  save(user: User) {
    return this.db.replace(user.id, { ...user['data'] });
  }

  async getNewDiscriminatorIfNeeded(userId: Id<'users'>, name: string) {
    const user = await this.getById(userId);
    if (!user) throw new AppError('User not found');

    const slug = slugify(`${name}--${user.discriminator}`);
    const exists = await this.getBySlug(slug);

    if (exists) {
      return await generateDiscriminator({ db: this.db }, name);
    } else {
      return user.discriminator;
    }
  }
}
