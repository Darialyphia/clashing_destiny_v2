import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';

export const carefulStudy: DestinyBlueprint = {
  id: 'careful_study',
  name: 'Careful Study',
  description: 'Draw 1 card.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  expCost: 1,
  tags: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.cardManager.drawFromDeck(1);
  }
};
