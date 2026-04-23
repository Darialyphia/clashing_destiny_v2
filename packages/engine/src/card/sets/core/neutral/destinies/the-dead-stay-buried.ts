import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';

export const theDeadStayBuried: DestinyBlueprint = {
  id: 'the_dead_stay_buried',
  name: 'The Dead Stay Buried',
  description: `<rt-ability cost="2"></rt-ability>Until the end of the turn, cards in both players discard pile cannot be targeted.`,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.NEUTRAL.id],
  expCost: 1,
  tags: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {}
};
