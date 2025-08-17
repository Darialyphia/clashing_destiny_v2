import dedent from 'dedent';
import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
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

export const novaBlast: SpellBlueprint = {
  id: 'nova-blast',
  name: 'Nova Blast',
  cardIconId: 'spell-comet',
  description: dedent`
  Deal 4 damage to all minions.
  This costs @[spellpower]@ less.
  `,
  collectable: true,
  unique: false,
  manaCost: 8,
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
    await card.modifiers.add(
      new Modifier('nova-blast-discount', game, card, {
        mixins: [
          new SpellInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor(value) {
              return Math.max(value! - card.player.hero.spellPower, 0);
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card) {
    const targets = [...card.player.minions, ...card.player.enemyMinions];

    for (const target of targets) {
      await target.takeDamage(card, new SpellDamage(4));
    }
  }
};
