import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { bloodboundInvader } from './tutorial/minions/bloodbound-invader';
import { tutorialWindbladeAdept } from './tutorial/minions/windblade-adept';
import { tutorialSilverguardOutpost } from './tutorial/destiny/silverguard-outpost';

export const tutorialSet: CardSet = {
  id: CARD_SETS.TUTORIAL,
  name: 'Tutorial Set',
  cards: [bloodboundInvader, tutorialWindbladeAdept, tutorialSilverguardOutpost]
};
