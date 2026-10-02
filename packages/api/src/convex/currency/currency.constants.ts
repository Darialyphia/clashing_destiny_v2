import type { Values } from '@game/shared';

export const CURRENCY_SOURCES = {
  GAME_VICTORY: 'game_victory', // gold reward when winning a game
  GAME_PARTICIPATION: 'game_participation', // gold reward for playing a ranked game
  QUEST_COMPLETION: 'quest_completion', // gold reward for completing a quest
  DAILY_LOGIN: 'daily_login', // gold reward for daily login
  ACHIEVEMENT: 'achievement', // gold reward for achieving milestones
  SEASON_REWARD: 'season_reward', // end of season rewards
  ADMIN_GRANT: 'admin_grant', // (disputes, manual adjustments, support tickets...)
  BOOSTER_PACK_PURCHASE: 'booster_pack_purchase', // deprecated
  SHOP_PURCHASE: 'shop_purchase', // purchase made in the shop
  SHOP_OFFER_CONTENT: 'shop_offer_content', // content of a shop offer
  DECRAFTING: 'decrafting', // decrafting items into crafting shards
  CRAFTING: 'crafting' // crafting items using crafting shards
} as const;

export type CurrencySource = Values<typeof CURRENCY_SOURCES>;

export const CURRENCY_TYPES = {
  GOLD: 'gold',
  CRAFTING_SHARDS: 'crafting_shards',
  PREMIUM: 'premium'
} as const;

export type CurrencyType = Values<typeof CURRENCY_TYPES>;

export const CURRENCY_REWARDS = {
  GAME_VICTORY_BASE: 50,
  GAME_PARTICIPATION: 10,
  DAILY_LOGIN_BASE: 20,
  FIRST_DAILY_LOGIN_BONUS: 50,
  SIGNUP_BONUS: 100
} as const;
