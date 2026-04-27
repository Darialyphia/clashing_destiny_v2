import { MinionOnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { UnitSimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';

export const primusFist: MinionBlueprint = {
  id: 'primus_fist',
  name: 'Primus Fist',
  description: '<rt-trigger>On Enter</rt-trigger>: Give adjacent allies +1 Attack.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 1,
  tags: [],
  atk: 2,
  retaliation: 1,
  maxHp: 3,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async event => {
        const adjacentAllies = event.data.unit.adjacentUnits.filter(u =>
          u.isAlly(card.player)
        );

        for (const ally of adjacentAllies) {
          await ally.modifiers.add(
            new UnitSimpleAttackBuffModifier('primus-fist-buff', game, card, {
              amount: 1
            })
          );
        }
      })
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
