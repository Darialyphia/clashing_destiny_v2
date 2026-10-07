import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { bloodboundInvader } from './tutorial/minions/bloodbound-invader';
import { tutorialWindbladeAdept } from './tutorial/minions/windblade-adept';
import { tutorialSilverguardOutpost } from './tutorial/destiny/silverguard-outpost';
import { tutorialSilverguardKnight } from './tutorial/minions/silverguard-knight';
import { bloodboundExecutor } from './tutorial/minions/bloodbound-executor';
import { bloodboundShaman } from './tutorial/minions/bloodbound-shaman';

export const tutorialSet: CardSet = {
  id: CARD_SETS.TUTORIAL,
  name: 'Tutorial Set',
  cards: [
    bloodboundInvader,
    tutorialWindbladeAdept,
    tutorialSilverguardOutpost,
    tutorialSilverguardKnight,
    bloodboundExecutor,
    bloodboundShaman
  ]
};
