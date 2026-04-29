import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { FreezeModifier } from '../../../../../modifier/modifiers/freeze.modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const frostShock: SpellBlueprint = {
  id: 'frost-shock',
  name: 'Frost Shock',
  description: dedent`
  <rt-keyword>Freeze</rt-keyword> an enemy minion and deal 1 damage to it.
  <rt-lvl-bonus lvl="3">This costs <rt-mana>1</rt-mana> less.</rt-lvl-bonus> 
  `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.WATER],
  manaCost: 3,
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(game, card, c => c.isEnemy(card.player)),
  getTargets(game, card, onCancel) {
    return singleMinionTargetRules.getTargets(game, card, {
      predicate: c => c.isEnemy(card.player),
      getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
      canCancel: true,
      onCancel,
      timeoutFallback: []
    });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay(game, card, { targets }) {
    const target = game.unitSystem.getUnitAt(targets[0]);
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 1));
    await target.modifiers.add(new FreezeModifier(game, card));

    const lvlMod = card.modifiers.get(LevelBonusModifier);
    if (lvlMod?.isActive) {
      await card.modifiers.add(
        new SimpleManacostModifier('frost-shock-mana-discount', game, card, {
          amount: -1
        })
      );
    }
  }
};
