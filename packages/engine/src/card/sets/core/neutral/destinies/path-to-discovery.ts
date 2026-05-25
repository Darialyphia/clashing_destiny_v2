import { predict } from '../../../../card-actions-utils';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, noTargets } from '../../../../card-utils';
import { AFFINITIES, CARD_KINDS, RARITIES } from '../../../../card.enums';

export const pathToDiscovery: DestinyBlueprint = {
  id: 'path-to-discovery',
  name: 'Path to Discovery',
  description:
    '<rt-trigger>On Enter</rt-trigger><rt-keyword>Predict</rt-keyword>, then draw a card.',
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
    await predict(game, card);
    await card.player.cardManager.draw(1);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
