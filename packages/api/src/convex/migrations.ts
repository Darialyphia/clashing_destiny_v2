import { Migrations } from '@convex-dev/migrations';
import { components, internal } from './_generated/api';
import schema from './schema';

export const migrations = new Migrations(components.migrations, { schema });

export const setPremiumCurrency = migrations.define({
  table: 'wallets',
  migrateOne: async (ctx, doc) => {
    if (doc.premiumCurrency === undefined) {
      await ctx.db.patch(doc._id, { premiumCurrency: 0 });
    }
  }
});

export const setDefaultGiftIcon = migrations.define({
  table: 'gifts',
  migrateOne: async (ctx, doc) => {
    if (doc.icon === undefined) {
      await ctx.db.patch(doc._id, { icon: 'gift-default' });
    }
  }
});

export const runAll = migrations.runner([
  internal.migrations.setPremiumCurrency,
  internal.migrations.setDefaultGiftIcon
]);
