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
import { BlastCardModifier } from '../../../../../modifier/modifiers/blast.modifier';
import { OverwhelmCardModifier } from '../../../../../modifier/modifiers/overwhelm.modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';

export const cosmicAvatar: MinionBlueprint = {
  id: 'cosmic-avatar',
  name: 'Cosmic Avatar',
  description: dedent`
  <rt-keyword>Blast</rt-keyword>, <rt-keyword>Overwhelm</rt-keyword>
  <br/>
  <rt-lvl-bonus lvl="3"><rt-keyword>Rush</rt-keyword></rt-lvl-bonus>
  <br/>
  <rt-lvl-bonus lvl="5">This costs <rt-mana>2</rt-mana> less.</rt-lvl-bonus>
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
  retaliation: 3,
  maxHp: 7,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(new BlastCardModifier(game, card, {}));
    await card.modifiers.add(new OverwhelmCardModifier(game, card, {}));

    await card.modifiers.add(
      new RushModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => lvlMod.isActiveForLevel(3))]
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
