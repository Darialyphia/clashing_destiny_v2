import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';

export const ceasefire: DestinyBlueprint = {
  id: 'ceasefire',
  name: 'Ceasefire',
  description:
    "Until the end of the turn, minions must pay <rt-mana>2</rt-mana> to attack the opponent's hero.",
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
