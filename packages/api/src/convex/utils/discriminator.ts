import type { QueryCtx } from '../_generated/server';
import type { Nullable } from '@game/shared';
import type { Doc } from '../_generated/dataModel';

// username discriminator stuff
const MAX_DISCRIMINATOR_VALUE = 9999;

const generateRandomDiscriminator = () => {
  const num = Math.round(Math.random() * MAX_DISCRIMINATOR_VALUE);

  return String(num).padStart(4, '0');
};

export const generateDiscriminator = async (
  { db }: Pick<QueryCtx, 'db'>,
  name: string
) => {
  let discriminator = generateRandomDiscriminator();
  let existingUser: Nullable<Doc<'users'>>;

  do {
    existingUser = await db
      .query('users')
      .withIndex('by_fullname', q =>
        q.eq('name', name).eq('discriminator', discriminator)
      )
      .unique();
    if (existingUser) {
      discriminator = generateRandomDiscriminator();
    }
  } while (existingUser != null);

  return discriminator;
};
