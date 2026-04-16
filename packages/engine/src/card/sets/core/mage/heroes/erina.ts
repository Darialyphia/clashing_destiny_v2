import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';

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
      id: 'erina-draw',
      label: 'Draw a card',
      description: 'Draw a card.',
      manaCost: 1,
      getTargets: () => Promise.resolve([]),
      getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
      getCooldown: () => 0,
      canUse: () => true,
      async onResolve(game, card) {
        await card.player.cardManager.drawFromDeck(1);
      }
    }
  ],
  async onInit(game, card) {},
  async onPlay(game, card) {}
};
