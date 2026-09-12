import type { CardSet } from '.';
import { CARD_SETS } from '../card.enums';
import { xenkaiArena } from './core/destinies/xenkai-arena';
import { dayOfConquest } from './core/destinies/day-of-conquest';
import { dayOfFortitude } from './core/destinies/day-of-fortitude';
import { restrainTheBeast } from './core/destinies/restrain-the-beast';
import { ashesOfPain } from './core/destinies/ashes-of-pain';
import { alcuinLibrary } from './core/destinies/alcuin-library';
import { igniteTheSky } from './core/destinies/ignite-the-sky';
import { lightAffinity } from './core/runes/light-affinity';
import { fireAffinity } from './core/runes/fire-affinity';
import { kaleosXaan } from './core/minions/kaleos-xaan';
import { flamewreath } from './core/minions/flamewreath';
import { rythmweaver } from './core/minions/rythmweaver';
import { fourWindsMagi } from './core/minions/four-windw-magi';
import { ghostLightning } from './core/spells/ghost-lightning';
import { gorehorn } from './core/minions/gorehorn';
import { chakriAvatar } from './core/minions/chakri-avatar';
import { flutterCrane } from './core/minions/fluttercrane';
import { mistDragonSeal } from './core/spells/mist-dragon-seal';
import { phoenixFire } from './core/spells/phoenix-fire';
import { innerFocus } from './core/spells/inner-focus';
import { kaidoAssassin } from './core/minions/kaido-assasin';
import { keshraiFanblade } from './core/minions/keshrai-fanblade';
import { tuskBoar } from './core/minions/tusk-boar';
import { assassinationProtocol } from './core/spells/assassination-protocol';
import { eightGates } from './core/spells/eight-gates';
import { firestormMantra } from './core/spells/firestorm-mantra';
import { syvrelTheExile } from './core/minions/syvrel-the-exile';
import { forgottenMarsh } from './core/destinies/forgotten-marsh';
import { counterstrike } from './core/secrets/counterstrike';

export const coreSet: CardSet = {
  id: CARD_SETS.CORE,
  name: 'Core Set',
  cards: [
    xenkaiArena,
    dayOfConquest,
    dayOfFortitude,
    restrainTheBeast,
    ashesOfPain,
    alcuinLibrary,
    igniteTheSky,
    lightAffinity,
    fireAffinity,
    kaleosXaan,
    flamewreath,
    rythmweaver,
    fourWindsMagi,
    ghostLightning,
    gorehorn,
    chakriAvatar,
    flutterCrane,
    mistDragonSeal,
    phoenixFire,
    innerFocus,
    kaidoAssassin,
    keshraiFanblade,
    tuskBoar,
    assassinationProtocol,
    eightGates,
    firestormMantra,
    syvrelTheExile,
    forgottenMarsh,
    counterstrike
  ]
};
