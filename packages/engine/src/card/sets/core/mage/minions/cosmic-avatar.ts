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
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { MinionOnAttackModifier } from '../../../../../modifier/on-attack.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { BlastCardModifier } from '../../../../../modifier/modifiers/blast.modifier';
import { OverwhelmCardModifier } from '../../../../../modifier/modifiers/overwhelm.modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const cosmicAvatar: MinionBlueprint = {
  id: 'cosmic-avatar',
  name: 'Cosmic Avatar',
  description: dedent`
   <rt-trigger>On Attack</rt-trigger> <rt-keyword>Empower (3)</rt-keyword>
   <br/>
   <rt-lvl-bonus lvl="3"></rt-lvl-bonus> <rt-keyword>Blast</rt-keyword>, <rt-keyword>Overwhelm</rt-keyword>
   <br/>
   <rt-lvl-bonus lvl="5"></rt-lvl-bonus> This costs <rt-mana>2</rt-mana> less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE.id],
  manaCost: 7,
  tags: [TAGS.GOLEM],
  atk: 3,
  retaliation: 2,
  maxHp: 7,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new MinionOnAttackModifier(game, card, {
        handler: async () => {
          await card.player.hero.modifiers.add(
            new EmpowerModifier(game, card, { amount: 1 })
          );
        }
      })
    );

    await card.modifiers.add(
      new BlastCardModifier(game, card, {
        unitMixins: [new TogglableModifierMixin(game, () => lvlMod.isActive)]
      })
    );

    await card.modifiers.add(
      new OverwhelmCardModifier(game, card, {
        unitMixins: [new TogglableModifierMixin(game, () => lvlMod.isActive)]
      })
    );

    await card.modifiers.add(
      new SimpleManacostModifier('cosmic-avatar-discount', game, card, {
        amount: -2,
        mixins: [new TogglableModifierMixin(game, () => lvlMod.isActiveForLevel(5))]
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
