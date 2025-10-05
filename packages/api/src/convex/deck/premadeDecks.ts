import { amuletOfRemembrance } from '@game/engine/src/card/sets/core/artifacts/amulet-of-remembrance';
import { arbitersMaul } from '@game/engine/src/card/sets/core/artifacts/arbiters-maul';
import { manaJewel } from '@game/engine/src/card/sets/core/artifacts/mana-jewel';
import { rustyBlade } from '@game/engine/src/card/sets/core/artifacts/rusty-blade';
import { scalesOfDestiny } from '@game/engine/src/card/sets/core/artifacts/scales-of-destiny';
import { unyieldingShield } from '@game/engine/src/card/sets/core/artifacts/unyielding-shield';
import { aidenLv1 } from '@game/engine/src/card/sets/core/heroes/aiden-lv1';
import { aidenLv2 } from '@game/engine/src/card/sets/core/heroes/aiden-lv2';
import { aidenLv3 } from '@game/engine/src/card/sets/core/heroes/aiden-lv3';
import { angelOfRetribution } from '@game/engine/src/card/sets/core/minions/angel-of-retribution';
import { bastionGuard } from '@game/engine/src/card/sets/core/minions/bastion-guard';
import { courageousFootsoldier } from '@game/engine/src/card/sets/core/minions/courageous-footsoldier';
import { flagBearerOfFlame } from '@game/engine/src/card/sets/core/minions/flag-bearer-of-flame';
import { friendlySlime } from '@game/engine/src/card/sets/core/minions/friendlySlime';
import { hotHeadedRecruit } from '@game/engine/src/card/sets/core/minions/hot-headed-recruit';
import { hougenThePunisher } from '@game/engine/src/card/sets/core/minions/hougen-the-punisher';
import { pyreboundLancer } from '@game/engine/src/card/sets/core/minions/pyrebound-lancer';
import { radiantCelestial } from '@game/engine/src/card/sets/core/minions/radiant-celestial';
import { royalGuard } from '@game/engine/src/card/sets/core/minions/royal-guard';
import { sharpShooter } from '@game/engine/src/card/sets/core/minions/sharpshooter';
import { shieldMaiden } from '@game/engine/src/card/sets/core/minions/shield-maiden';
import { stalwartVanguard } from '@game/engine/src/card/sets/core/minions/stalwart-vanguard';
import { blindingLight } from '@game/engine/src/card/sets/core/spells/blinding-light';
import { fireball } from '@game/engine/src/card/sets/core/spells/fireball';
import { flamingFrenzy } from '@game/engine/src/card/sets/core/spells/flaming-frenzy';
import { gazeIntoTomorrow } from '@game/engine/src/card/sets/core/spells/gaze-into-tomorrow';
import { grandCross } from '@game/engine/src/card/sets/core/spells/grand-cross';
import { ironWall } from '@game/engine/src/card/sets/core/spells/iron-wall';
import { knightsInspiration } from '@game/engine/src/card/sets/core/spells/knights-inspiration';
import { sunburst } from '@game/engine/src/card/sets/core/spells/sunburst';

type PremadeDeck = {
  id: string;
  isGrantedOnAccountCreation: boolean;
  name: string;
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
    mainDeck: [
      {
        blueprintId: courageousFootsoldier.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: rustyBlade.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: flagBearerOfFlame.id,
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: shieldMaiden.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: knightsInspiration.id,
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: hotHeadedRecruit.id,
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: fireball.id,
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: gazeIntoTomorrow.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: sharpShooter.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: friendlySlime.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: pyreboundLancer.id,
        copies: 2,
        isFoil: false
      },
      {
        blueprintId: hougenThePunisher.id,
        copies: 2,
        isFoil: false
      },
      {
        blueprintId: grandCross.id,
        copies: 2,
        isFoil: false
      },
      {
        blueprintId: royalGuard.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: stalwartVanguard.id,
        copies: 3,
        isFoil: false
      },
      {
        blueprintId: blindingLight.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: sunburst.id,
        copies: 4,
        isFoil: false
      },
      {
        blueprintId: bastionGuard.id,
        copies: 4,
        isFoil: false
      }
    ],
    destinyDeck: [
      {
        blueprintId: aidenLv1.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: aidenLv2.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: aidenLv3.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: unyieldingShield.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: ironWall.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: amuletOfRemembrance.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: flamingFrenzy.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: angelOfRetribution.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: radiantCelestial.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: arbitersMaul.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: manaJewel.id,
        copies: 1,
        isFoil: false
      },
      {
        blueprintId: scalesOfDestiny.id,
        copies: 1,
        isFoil: false
      }
    ]
  }
];
