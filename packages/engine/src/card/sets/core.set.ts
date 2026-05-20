import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaVioletWitch } from './core/fire/heroes/erina-violet-witch';
import { healingMystic } from './core/neutral/minions/healing-mystic';
import { fireBolt } from './core/fire/spells/fire-bolt';
import { littleWitch } from './core/neutral/minions/little-witch';
import { pyromancer } from './core/fire/minions/pyromancer';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [erinaVioletWitch, healingMystic, fireBolt, littleWitch, pyromancer]
};
