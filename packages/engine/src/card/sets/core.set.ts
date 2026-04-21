import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { sample } from './core/neutral/minions/sample';
import { erina } from './core/mage/heroes/erina';
import { carefulStudy } from './core/neutral/destinies/careful-study';
import { sample2 } from './core/neutral/minions/sample2';
import { fireBolt } from './core/mage/spells/fire-bolt';
import { frostShock } from './core/mage/spells/frost-shock';
import { wizardTutor } from './core/mage/minions/wizard-tutor';
import { manaFueledGolem } from './core/mage/minions/mana-fueled-golem';
import { apprenticeMagician } from './core/mage/minions/apprentice-magician';
import { arcaneMaster } from './core/mage/minions/arcane-master';
import { orbPonderer } from './core/mage/minions/orb-ponderer';
import { gargoyle } from './core/mage/minions/gargoyle';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    erina,
    sample,
    carefulStudy,
    sample2,
    fireBolt,
    frostShock,
    wizardTutor,
    manaFueledGolem,
    apprenticeMagician,
    arcaneMaster,
    orbPonderer,
    gargoyle
  ]
};
