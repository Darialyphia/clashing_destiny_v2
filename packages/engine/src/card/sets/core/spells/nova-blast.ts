import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { LineageBonusModifier } from '../../../../modifier/modifiers/lineage-bonus.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
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

export const novaBlast: SpellBlueprint<MinionCard> = {
  id: 'nova-blast',
  name: 'Nova Blast',
  cardIconId: 'spell-comet',
  description: `Deal 3 damage to all minions. @[lineage] @[level] 3+ bonus@: This costs 3 less.`,
  collectable: true,
  unique: false,
  manaCost: 6,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    const levelMod = new LevelBonusModifier<SpellCard>(game, card, 3);
    await card.modifiers.add(levelMod);

    await card.modifiers.add(
      new Modifier('nova-blast-discount', game, card, {
        mixins: [
          new SpellInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor(value) {
              return levelMod.isActive ? Math.max(value! - 3, 0) : value;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card) {
    const targets = [...card.player.minions, ...card.player.enemyMinions];

    for (const target of targets) {
      await target.takeDamage(card, new SpellDamage(3));
    }
  }
};
