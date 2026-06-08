import type { HeroBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, noTargets } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  CARD_LOCATIONS,
  AFFINITIES
} from '../../../../card.enums';

export const erinaVioletWitch: HeroBlueprint = {
  id: 'erina-violet-witch',
  kind: CARD_KINDS.HERO,
  collectable: true,
  name: 'Erina, Violet Witch',
  description: '',
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE, AFFINITIES.ASTRAL],
  tags: [],
  maxHp: 25,
  abilities: [
    {
      id: 'erina-ability1',
      label: 'Draw a card',
      description: 'Draw a card.',
      manaCost: 1,
      canUse: (game, card) => {
        return true;
      },
      getTargets: noTargets,
      async onResolve(game, card) {
        await card.player.cardManager.draw(1);
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  async onInit(game, card) {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1
  }
};
