import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { LineageBonusModifier } from '../../../../modifier/modifiers/lineage-bonus.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.card';
import { SpellCard } from '../../../entities/spell.entity';
import { mage } from '../heroes/mage';

export const fireBall: SpellBlueprint<MinionCard> = {
  id: 'fire-ball',
  name: 'Fire Ball',
  cardIconId: 'fire-ball',
  description: `Deal 3 damage to an enemy minion. Inflict @Burn@ to adjacent minions.\n@Lineage Bonus(${mage.name})@: this costs 1 less.`,
  collectable: true,
  unique: false,
  manaCost: 4,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.CAST,
  canPlay: singleEnemyMinionTargetRules.canPlay,
  getPreResponseTargets: singleEnemyMinionTargetRules.getPreResponseTargets,
  async onInit(game, card) {
    const lineageMod = new LineageBonusModifier<SpellCard>(game, card, mage.id);
    await card.modifiers.add(lineageMod);

    await card.modifiers.add(
      new Modifier('fireball-discount', game, card, {
        mixins: [
          new SpellInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor(value) {
              return lineageMod.isActive ? Math.max(value! - 1, 0) : value;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card, [target]) {
    const adjacentMinions = target.slot?.adjacentMinions ?? [];
    await target.takeDamage(card, new SpellDamage(3));

    for (const minion of adjacentMinions) {
      await minion.modifiers.add(new BurnModifier(game, card));
    }
  }
};
