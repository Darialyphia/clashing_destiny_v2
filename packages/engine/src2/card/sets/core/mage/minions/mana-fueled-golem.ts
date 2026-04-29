import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES,
  TAGS
} from '../../../../card.enums';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { UnitInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { getEmpowerStacks } from '../../../../card-actions-utils';

export const manaFueledGolem: MinionBlueprint = {
  id: 'mana-fueled-golem',
  name: 'Mana-Fueled Golem',
  description: dedent`
   This cannot attack or move unless your hero is <rt-keyword>Empowered</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE.id],
  manaCost: 3,
  tags: [TAGS.GOLEM],
  atk: 3,
  retaliation: 2,
  maxHp: 6,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('mana-fueled-golem-empower', game, card, {
          name: 'Powered Down',
          description: 'Cannot attack or move',
          icon: 'keyword-cannot',
          mixins: [
            new UnitInterceptorModifierMixin(game, {
              key: 'canAttack',
              interceptor: () => false
            }),
            new UnitInterceptorModifierMixin(game, {
              key: 'canMove',
              interceptor: () => false
            }),
            new TogglableModifierMixin(game, () => getEmpowerStacks(card) === 0)
          ]
        })
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
