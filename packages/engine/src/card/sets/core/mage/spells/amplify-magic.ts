import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { BurstModifier } from '../../../../../modifier/modifiers/burst.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const amplifyMagic: SpellBlueprint = {
  id: 'amplify-magic',
  name: 'Amplify Magic',
  description: dedent`
  <rt-keyword>Empower (1)</rt-keyword> then draw a card.
  <rt-lvl-bonus lvl="2"><rt-keyword>Burst</rt-keyword>.</rt-lvl-bonus> 
  <rt-lvl-bonus lvl="3"><rt-keyword>Empower (2)</rt-keyword> instead</rt-lvl-bonus>.
  `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.FIRE],
  manaCost: 1,
  canPlay: () => true,
  getTargets(game, card, onCancel) {
    return anywhereTargetRules.getTargets({
      min: 1,
      max: 1,
      allowRepeat: false
    })(game, card, {
      getAoe: targets => card.getAOE(targets),
      canCancel: true,
      onCancel
    });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));

    const levelMod = card.modifiers.get(LevelBonusModifier)!;
    await card.player.hero.modifiers.add(
      new BurstModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );
  },
  async onPlay(game, card) {
    const levelMod = card.modifiers.get(LevelBonusModifier)!;

    await card.player.hero.modifiers.add(
      new EmpowerModifier(game, card, { amount: levelMod.isActiveForLevel(3) ? 2 : 1 })
    );

    await card.player.cardManager.drawFromDeck(1);
  }
};
