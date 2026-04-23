import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { AnchoredUnitModifier } from '../../../../../modifier/modifiers/anchored.modifier';

export const quicksands: SpellBlueprint = {
  id: 'quicksands',
  name: 'Quicksands',
  description: dedent`
  Give a minion <rt-keyword>Anchored</rt-keyword>.
  `,
  kind: CARD_KINDS.SPELL,
  collectable: true,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.EARTH],
  manaCost: 2,
  canPlay: (game, card) => singleMinionTargetRules.canPlay(game, card),
  getTargets(game, card, onCancel) {
    return singleMinionTargetRules.getTargets(game, card, {
      getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
      canCancel: true,
      onCancel,
      timeoutFallback: []
    });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  async onInit() {},
  async onPlay(game, card, { targets }) {
    const target = targets[0].unit;
    if (!target) return;
    await target.modifiers.add(new AnchoredUnitModifier(game, card));
  }
};
