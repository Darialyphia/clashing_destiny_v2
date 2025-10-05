import { internalMutation } from './_generated/server';

const matchmakings = [{ name: 'Ranked', enabled: true }];
export default internalMutation(async ({ db }) => {
  for (const matchmaking of matchmakings) {
    const existing = await db
      .query('matchmaking')
      .withIndex('by_name', q => q.eq('name', matchmaking.name))
      .first();
    if (existing) continue;

    await db.insert('matchmaking', matchmaking);
  }
});
