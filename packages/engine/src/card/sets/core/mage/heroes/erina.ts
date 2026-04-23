import { TARGETING_TYPES } from '../../../../../aoe/aoe.enums';
import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  JOBS,
  RARITIES
} from '../../../../card.enums';

export const erina: HeroBlueprint = {
  id: 'erina',
  name: 'Erina',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.HERO,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE.id],
  tags: [],
  atk: 0,
  retaliation: 0,
  maxHp: 20,
  abilities: [
    {
      id: 'erina-ability1',
      label: 'Draw a card',
      description: 'Draw a card.',
      manaCost: 1,
      canUse: (game, card) => {
        return card.location === CARD_LOCATIONS.BOARD;
      },
      getAoe: () => new NoAOEShape(TARGETING_TYPES.ENEMY_UNIT, {}),
      getCooldown: () => 0,
      getTargets: () => Promise.resolve([]),
      async onResolve(game, card) {
        await card.player.cardManager.drawFromDeck(1);
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
