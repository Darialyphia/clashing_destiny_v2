import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isMinion, noTargets } from '../../../../card-utils';
import { AFFINITIES, CARD_KINDS, RARITIES } from '../../../../card.enums';

export const cullTheWeak: DestinyBlueprint = {
  id: 'cull-the-weak',
  name: 'Cull the Weak',
  description:
    '<rt-trigger>On Enter</rt-trigger>Destroy all minions with a cost of <rt-mana>2</rt-mana> or less.',
  collectable: true,
  setId: 'CORE',
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.RARE,
  jobs: [],
  affinities: [AFFINITIES.NEUTRAL],
  expCost: 2,
  tags: [],
  getTargets: noTargets,
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    const minionsToDestroy = game.cardSystem
      .getAllCardsInPlay()
      .filter(c => isMinion(c) && c.manaCost <= 2);

    for (const minion of minionsToDestroy) {
      await minion.destroy(card);
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
