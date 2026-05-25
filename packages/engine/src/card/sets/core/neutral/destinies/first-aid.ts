import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, noTargets } from '../../../../card-utils';
import { AFFINITIES, CARD_KINDS, RARITIES } from '../../../../card.enums';

export const firstAid: DestinyBlueprint = {
  id: 'first-aid',
  name: 'First Aid',
  description: '<rt-trigger>On Enter</rt-trigger>Heal your hero for 4.',
  collectable: true,
  setId: 'CORE',
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  expCost: 1,
  tags: [],
  getTargets: noTargets,
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.heal(4);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
