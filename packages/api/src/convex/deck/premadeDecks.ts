import { SPELL_SCHOOLS, type SpellSchool } from '@game/engine/src/card/card.enums';
import { cards } from '@game/engine/src/generated/cards';

type PremadeDeck = {
  id: string;
  isGrantedOnAccountCreation: boolean;
  name: string;
  spellSchools: SpellSchool[];
  mainDeck: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
  destinyDeck: Array<{
    blueprintId: string;
    copies: number;
    isFoil: boolean;
  }>;
};

export const premadeDecks: PremadeDeck[] = [
  {
    id: 'aiden-starter',
    isGrantedOnAccountCreation: true,
    name: 'Aiden Starter',
    spellSchools: [SPELL_SCHOOLS.FIRE, SPELL_SCHOOLS.LIGHT],
    mainDeck: [
      {
        blueprintId: cards['courageous-footsoldier'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['rusty-blade'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['flagbearer-of-flame'],
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: cards['shield-maiden'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['knights-inspiration'],
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: cards['hot-headed-recruit'],
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: cards['fireball'],
        copies: 2,
        isFoil: false
      },
      {
        blueprintId: cards['gaze-into-tomorrow'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['sharpshooter'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['friendly-slime'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['pyrebound-lancer'],
        copies: 2,
        isFoil: false
      },
      {
        blueprintId: cards['hougen-the-punisher'],
        copies: 2,
        isFoil: false
      },
      {
        blueprintId: cards['grand-cross'],
        copies: 2,
        isFoil: false
      },
      {
        blueprintId: cards['royal-guard'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['stalwart-vanguard'],
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: cards['blinding-light'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['sunburst'],
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: cards['bastion-guard'],
        copies: 4,
        isFoil: false
      }
    ],
    destinyDeck: [
      {
        blueprintId: cards['aiden-lv1'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['aiden-lv2'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['aiden-lv3'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['unyielding-shield'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['iron-wall'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['amulet-of-remembrance'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['flaming-frenzy'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['angel-of-retribution'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['radiant-celestial'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['arbiter-maul'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['mana-jewel'],
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: cards['scales-of-destiny'],
        copies: 1,
        isFoil: false
      }
    ]
  }
];
