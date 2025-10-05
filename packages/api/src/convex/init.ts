import { internalMutation } from './_generated/server';

const matchmakings = [
  { name: 'Ranked', enabled: true },
  { name: 'Casual', enabled: false },
  { name: 'VS. AI', enabled: false }
];
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
