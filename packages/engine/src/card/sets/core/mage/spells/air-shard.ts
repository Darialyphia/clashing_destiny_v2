import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';

export const airShard: SpellBlueprint = {
  id: 'air-shard',
  name: 'Air Shard',
  description: dedent`
  Relocate a minion.
  Costs <rt-mana>0</rt-mana> if you played an Air spell this turn.
  `,
  kind: CARD_KINDS.SPELL,
  collectable: false,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.AIR],
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
    const target = targets[0].unit;
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(card, 2));
  }
};
