import { query } from './_generated/server';

export const ping = query(() => {
  return 'Convex is working!';
});
