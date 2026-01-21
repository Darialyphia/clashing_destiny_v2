export const CURRENCY_SOURCES = {
  GAME_VICTORY: 'game_victory',
  GAME_PARTICIPATION: 'game_participation',
  QUEST_COMPLETION: 'quest_completion',
  DAILY_LOGIN: 'daily_login',
  ACHIEVEMENT: 'achievement',
  SEASON_REWARD: 'season_reward',
  ADMIN_GRANT: 'admin_grant',
  SPEND: 'spend',
  BOOSTER_PACK_PURCHASE: 'booster_pack_purchase'
} as const;

export type CurrencySource = (typeof CURRENCY_SOURCES)[keyof typeof CURRENCY_SOURCES];

export const CURRENCY_TYPES = {
  GOLD: 'gold',
  CRAFTING_SHARDS: 'crafting_shards'
} as const;

export type CurrencyType = (typeof CURRENCY_TYPES)[keyof typeof CURRENCY_TYPES];

export const CURRENCY_REWARDS = {
  GAME_VICTORY_BASE: 50,
  GAME_PARTICIPATION: 10,
  DAILY_LOGIN_BASE: 20,
  FIRST_DAILY_LOGIN_BONUS: 50,
  SIGNUP_BONUS: 100
} as const;
