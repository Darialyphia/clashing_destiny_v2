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
import { MagicVeilModifier } from '../../../../../modifier/modifiers/magic-veil.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { SpellGuardUnitModifier } from '../../../../../modifier/modifiers/spell-guard.modifier';
import { UnitAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { Unit } from '../../../../../unit/unit.entity';

export const gargoyle: MinionBlueprint = {
  id: 'gargoyle',
  name: 'Gargoyle',
  description: dedent`
   <rt-keyword>Magic Veil</rt-keyword>.
   <rt-lvl-bonus lvl="3"></rt-lvl-bonus>This unit and adjacent allies have <rt-keyword>Spell Guard (1)</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE.id],
  manaCost: 2,
  tags: [TAGS.GOLEM],
  atk: 0,
  retaliation: 2,
  maxHp: 5,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new MagicVeilModifier(game, card));

    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier<Unit>('gargoyle-spell-guard', game, card, {
          mixins: [
            new TogglableModifierMixin(game, () => lvlMod.isActive),
            new UnitAuraModifierMixin(game, card, {
              isElligible(candidate) {
                return (
                  candidate.equals(card.unit) ||
                  (candidate.isAdjacentTo(card.unit) && candidate.isAlly(card.unit))
                );
              },
              getModifiers() {
                return [new SpellGuardUnitModifier(game, card, { amount: 1 })];
              }
            })
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
