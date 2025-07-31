import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { HeroCard } from '../../../entities/hero.entity';

export const sage: HeroBlueprint = {
  id: 'sage',
  name: 'Sage',
  cardIconId: 'hero-sage',
  description:
    'Reduce the cost of spells in your hand by 1 as long as you have at least 4 @[spellpower]@.',
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  affinities: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 20,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    const manaCostReduction = () =>
      new Modifier('sage-discount', game, card, {
        mixins: [
          new SpellInterceptorModifierMixin(game, {
            key: 'manaCost',
            interceptor(value) {
              return Math.max(value! - 1, 0);
            }
          })
        ]
      });
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('sage-spell-cost-reduction-aura', game, card, {
        icon: 'modifier-double-cast',
        name: 'One with the magic',
        description: 'Reduce the cost of spells in your hand by 1.',
        mixins: [
          new TogglableModifierMixin(game, () => card.player.hero.spellPower >= 4),
          new AuraModifierMixin(game, {
            canSelfApply: false,
            isElligible(candidate) {
              return candidate.kind === CARD_KINDS.SPELL && candidate.location === 'hand';
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(manaCostReduction());
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove('sage-discount');
            }
          })
        ]
      })
    );
  }
};
