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
import { warrior } from '../heroes/warrior';
import type { AttackCard } from '../../../entities/attack.entity';

export const finalSlash: AttackBlueprint = {
  id: 'final-slash',
  name: 'Final Slash',
  cardIconId: 'final-slash',
  description: `@[lineage] ${warrior.name} bonus@ : Multiply this card's damage by your hero level.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  damage: 2,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ATTACK,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: attackRules.getPreResponseTargets,
  async onInit(game, card) {
    const lineageMod = new LineageBonusModifier<AttackCard>(game, card, warrior.id);
    await card.modifiers.add(lineageMod);

    await card.modifiers.add(
      new Modifier('finalSlash', game, card, {
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
