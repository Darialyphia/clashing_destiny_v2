import { internalMutation } from './_generated/server';

const matchmakings = [
  {
    name: 'Ranked',
    enabled: true,
    description: 'Climb the ranks in a competitive environment.'
  },
  {
    name: 'Casual',
    enabled: false,
    description: 'Relaxed matches for fun and practice.'
  },
  {
    name: 'VS. AI',
    enabled: false,
    description: 'Play against AI opponents.'
  }
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
