import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { erinaVioletWitch } from './core/fire/heroes/erina-violet-witch';
import { healingMystic } from './core/neutral/minions/healing-mystic';
import { fireBolt } from './core/fire/spells/fire-bolt';
import { littleWitch } from './core/neutral/minions/little-witch';
import { pyromancer } from './core/fire/minions/pyromancer';
import { fireBall } from './core/fire/spells/fire-ball';
import { firstAid } from './core/neutral/destinies/first-aid';
import { pathToDiscovery } from './core/neutral/destinies/path-to-discovery';
import { cullTheWeak } from './core/neutral/destinies/cull-the-weak';
import { burningHands } from './core/fire/destinies/burning-hands';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    erinaVioletWitch,
    healingMystic,
    fireBolt,
    littleWitch,
    pyromancer,
    fireBall,
    firstAid,
    pathToDiscovery,
    cullTheWeak,
    burningHands
  ]
};
