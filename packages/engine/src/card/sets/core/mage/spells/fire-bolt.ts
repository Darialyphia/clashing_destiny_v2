import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';

export const fireBolt: SpellBlueprint = {
  id: 'fire-bolt',
  name: 'Fire Bolt',
  description: dedent`
  Deal 2 damage to a minion.
  <rt-lvl-bonus lvl="3"></rt-lvl-bonus> Deal 1 damage to the enemy Hero.
  `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [],
  manaCost: 1,
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

    await target.takeDamage(card, new SpellDamage(card, 2));

    const lvlMod = card.modifiers.get(LevelBonusModifier);
    if (lvlMod?.isActive) {
      await card.player.opponent.takeDamage(card, new SpellDamage(card, 1));
    }
  }
};
