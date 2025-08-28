import slugify from 'slugify';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';

export type UserId = Id<'users'>;
export type UserDoc = Doc<'users'>;

export class User extends Entity<Id<'users'>, UserDoc> {
  get name() {
    return this.data.name;
  }

  get discriminator() {
    return this.data.discriminator;
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

  rename(name: string, discriminator: string) {
    this.data.name = name;
    this.data.discriminator = discriminator;
    this.data.slug = slugify(`${name}--${discriminator}`);
  }
}
