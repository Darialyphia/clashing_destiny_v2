import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { bloodboundInvader } from './tutorial/minions/bloodbound-invader';
import { tutorialWindbladeAdept } from './tutorial/minions/windblade-adept';
import { tutorialSilverguardOutpost } from './tutorial/destiny/silverguard-outpost';
import { tutorialSilverguardKnight } from './tutorial/minions/silverguard-knight';
import { bloodboundExecutor } from './tutorial/minions/bloodbound-executor';
import { bloodboundShaman } from './tutorial/minions/bloodbound-shaman';
import { tutorialSuntideMaiden } from './tutorial/minions/suntide-maiden';
import { tutorialLionheartBlessing } from './tutorial/spells/lionheart-blessing';
import { tutorialTrueStrike } from './tutorial/spells/true-strike';
import { tutorialSunstoneTemplar } from './tutorial/minions/sunstone-templar';
import { tutorialArclyteRegalia } from './tutorial/artifacts/arclyte-regalia';
import { tutorialHolyImmolation } from './tutorial/secrets/holy-immolation';
import { tutorialAzuriteLion } from './tutorial/minions/azurite-lion';
import { tutorialIroncliffeGuardian } from './tutorial/minions/ironcliffe-guardian';
import { tutorialSunbreaker } from './tutorial/minions/sunbreaker';
import { tutorialBloodsunArena } from './tutorial/destiny/bloodsun-arena';
import { tutorialMistveilMarsh } from './tutorial/destiny/mistveil-marsh';
import { tutorialMoonlitPass } from './tutorial/destiny/moonlit-pass';

export const tutorialSet: CardSet = {
  id: CARD_SETS.TUTORIAL,
  name: 'Tutorial Set',
  cards: [
    bloodboundInvader,
    tutorialWindbladeAdept,
    tutorialSilverguardOutpost,
    tutorialSilverguardKnight,
    bloodboundExecutor,
    bloodboundShaman,
    tutorialSuntideMaiden,
    tutorialLionheartBlessing,
    tutorialTrueStrike,
    tutorialSunstoneTemplar,
    tutorialArclyteRegalia,
    tutorialHolyImmolation,
    tutorialAzuriteLion,
    tutorialIroncliffeGuardian,
    tutorialSunbreaker,
    tutorialBloodsunArena,
    tutorialMistveilMarsh,
    tutorialMoonlitPass
  ]
};
