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
import { RegenerationModifier } from '../../../../../modifier/modifiers/regeneration.modifier';

export const earthShard: SpellBlueprint = {
  id: 'earth-shard',
  name: 'Earth Shard',
  description: dedent`
  Give a minion <rt-keyword>Regeneration 2</rt-keyword>.
  Costs <rt-mana>0</rt-mana> if you played an Earth spell this turn.
  `,
  kind: CARD_KINDS.SPELL,
  collectable: false,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  jobs: [JOBS.MAGE.id],
  tags: [TAGS.EARTH],
  manaCost: 1,
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
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<SpellCard>('earth-shard-discount', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () =>
            card.player.cardTracker.hasPlayedThisTurn(
              c => isSpell(c) && c.hasTag(TAGS.EARTH)
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

    await target.modifiers.add(new RegenerationModifier(game, card, { stacks: 2 }));
  }
};
