import dedent from 'dedent';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import { SpellDamage } from '../../../../../utils/damage';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, isSpell, singleMinionTargetRules } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, RARITIES, JOBS, TAGS } from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import type { SpellCard } from '../../../../entities/spell-card.entity';
import { FreezeModifier } from '../../../../../modifier/modifiers/freeze.modifier';

export const waterShard: SpellBlueprint = {
  id: 'water-shard',
  name: 'Water Shard',
  description: dedent`
  Exhaust an minion that costs 3 or less. If it is already exhausted, <rt-keyword>Freeze</rt-keyword> it instead.
  Costs <rt-mana>0</rt-mana> if you played a Water spell this turn.
  `,
  kind: CARD_KINDS.SPELL,
  collectable: false,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.WATER],
  manaCost: 1,
  canPlay: (game, card) =>
    singleMinionTargetRules.canPlay(
      game,
      card,
      c => c.isEnemy(card.player) && c.card.manaCost <= 3
    ),
  getTargets(game, card, onCancel) {
    return singleMinionTargetRules.getTargets(game, card, {
      predicate: c => c.isEnemy(card.player) && c.card.manaCost <= 3,
      getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
      canCancel: true,
      onCancel,
      timeoutFallback: []
    });
  },
  getAoe: () => new PointAOEShape(TARGETING_TYPE.ENEMY_UNIT, {}),
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<SpellCard>('water-shard-discount', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () =>
            card.player.cardTracker.hasPlayedThisTurn(
              c => isSpell(c) && c.hasTag(TAGS.WATER)
            )
          ),
          new CardInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor: () => {
              return 0;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card, { targets }) {
    const target = targets[0].unit;
    if (!target) return;

    if (target.isExhausted) {
      await target.modifiers.add(new FreezeModifier(game, card));
    } else {
      await target.exhaust();
    }
  }
};
