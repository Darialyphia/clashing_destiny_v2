import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { DAMAGE_TYPES } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  isMinion,
  singleMinionTargetRules
} from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  JOBS,
  TAGS,
  MINION_TYPES
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { UnitInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';

export const windShield: SpellBlueprint = {
  id: 'wind-shield',
  name: 'Wind Shield',
  description: dedent`
  Target ally minion takes half damage (rounded down) from Ranged minions..
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
    singleMinionTargetRules.canPlay(game, card, c => c.isAlly(card.player)),
  getTargets(game, card, onCancel) {
    return singleMinionTargetRules.getTargets(game, card, {
      predicate: c => c.isAlly(card.player),
      getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
      canCancel: true,
      onCancel,
      timeoutFallback: []
    });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  async onInit() {},
  async onPlay(game, card, { targets }) {
    await targets[0].unit?.modifiers.add(
      new Modifier('wind-shield', game, card, {
        mixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'damageReceived',
            interceptor: (value, ctx) => {
              if (ctx.damage.type !== DAMAGE_TYPES.COMBAT) return value;
              const source = ctx.damage.source;
              if (!isMinion(source)) return value;
              if (source.subKind !== MINION_TYPES.RANGED) return value;
              return Math.floor(value / 2);
            }
          })
        ]
      })
    );
  }
};
