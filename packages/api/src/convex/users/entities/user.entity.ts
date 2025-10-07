import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { Override } from '@game/shared';
import { Username } from '../username';
import { Email } from '../../utils/email';

export type UserId = Id<'users'>;
export type UserDoc = Doc<'users'>;
export type UserData = Override<UserDoc, { username: Username; email: Email }>;

export class User extends Entity<UserId, UserData> {
  static from(doc: UserDoc) {
    return new User(doc._id, {
      ...doc,
      email: new Email(doc.email),
      username: new Username(doc.username)
    });
  }

  constructor(id: Id<'users'>, data: UserData) {
    super(id, data);
  }

  get username() {
    return this.data.username;
  }

  get email() {
    return this.data.email;
  }

  get passwordHash() {
    return this.data.passwordHash;
  }

  get mmr() {
    return this.data.mmr;
  }

  get slug() {
    return this.data.slug;
  }

  rename(name: string) {
    this.data.username = new Username(name);
    this.data.slug = this.data.username.toSlug();
  }
}
