import dedent from 'dedent';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { scry } from '../../../card-actions-utils';
import type { PreResponseTarget, SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import type { SpellCard } from '../../../entities/spell.entity';

export const thirstForKnowledge: SpellBlueprint = {
  id: 'thirst-for-knowledge',
  name: 'Thirst for Knowledge',
  cardIconId: 'spell-thirst-for-knowledge',
  description: dedent`
  This costs @[spellpower]@ less.
  Draw 2 cards.
  `,
  collectable: true,
  unique: false,
  manaCost: 5,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier('thirst-for-knowledge-discount', game, card, {
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
    await card.player.cardManager.draw(2);
  }
};
