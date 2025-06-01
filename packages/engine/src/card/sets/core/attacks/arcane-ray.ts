import { AttackInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LineageBonusModifier } from '../../../../modifier/modifiers/lineage-bonus.modifier';
import type { AttackBlueprint } from '../../../card-blueprint';
import { attackRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { AttackCard } from '../../../entities/attck.entity';
import { mage } from '../heroes/mage';

export const arcaneRay: AttackBlueprint = {
  id: 'arcane-ray',
  name: 'Arcane Ray',
  cardIconId: 'arcane-ray',
  description: `@Piercing@\n@Lineage Bonus(${mage.name})@: Deals + spellpower damage.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  damage: 2,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ATTACK,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: attackRules.getPreResponseTargets,
  async onInit(game, card) {
    const lineageMod = new LineageBonusModifier<AttackCard>(game, card, mage.id);
    await card.modifiers.add(lineageMod);

    await card.modifiers.add(
      new Modifier('arcane-ray', game, card, {
        mixins: [
          new AttackInterceptorModifierMixin(game, {
            key: 'damage',
            interceptor(value) {
              return lineageMod.isActive ? value * card.player.hero.level : value;
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
