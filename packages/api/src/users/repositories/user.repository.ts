import type { Doc, Id } from '../../_generated/dataModel';
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
    const userData = await this.db
      .query('users')
      .withIndex('by_email', q => q.eq('email', email.value))
      .unique();

    if (!userData) return null;

    return new User(userData);
  }

  async getById(userId: Id<'users'>) {
    const userData = await this.db.get(userId);

    if (!userData) return null;

    return new User(userData);
  }

  async getBySlug(slug: string) {
    const userData = await this.db
      .query('users')
      .withIndex('by_slug', q => q.eq('slug', slug))
      .unique();

    if (!userData) return null;

    return new User(userData);
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
