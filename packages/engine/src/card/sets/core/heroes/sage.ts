import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
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
import { SpellCard } from '../../../entities/spell.entity';

export const sage: HeroBlueprint = {
  id: 'sage',
  name: 'Sage',
  cardIconId: 'hero-sage',
  description:
    'Reduce the cost of spells in your hand by 2 as long as you have at least 4 @[spellpower]@.',
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  affinities: [AFFINITIES.COSMIC, AFFINITIES.ARCANE, AFFINITIES.CHRONO],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 1,
  atk: 0,
  maxHp: 24,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'sage-ability',
      label: 'Double cast',
      description:
        '@[exhaust]@ @[mana] 1@Add a copy of the last spell card that was played. You can play it as if you had unlocked its affinity.',
      canUse(game, card) {
        return card.player.hero.spellPower >= 4;
      },
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      shouldExhaust: true,
      async onResolve(game, card) {
        const lastSpell = game.cardSystem.getLastPlayedCard<SpellCard>(
          card => card.kind === CARD_KINDS.SPELL
        );
        if (!lastSpell) return;
        const copy = await card.player.generateCard<SpellCard>(lastSpell.blueprint.id);
        await copy.modifiers.add(
          new Modifier('sage-copy', game, card, {
            mixins: [
              new SpellInterceptorModifierMixin(game, {
                key: 'hasAffinityMatch',
                interceptor: () => true
              })
            ]
          })
        );
        await card.player.cardManager.addToHand(copy);
      }
    }
  ],
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    const manaCostReduction = new Modifier('sage-discount', game, card, {
      mixins: [
        new SpellInterceptorModifierMixin(game, {
          key: 'manaCost',
          interceptor(value) {
            return card.player.hero.spellPower >= 4 ? Math.max(value! - 2, 0) : value;
          }
        })
      ]
    });

    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('sage-spell-cost-reduction-aura', game, card, {
        icon: 'modifier-double-cast',
        name: 'One with the magic',
        description: 'Reduce the cost of spells in your hand by 2.',
        mixins: [
          new AuraModifierMixin(game, {
            canSelfApply: false,
            isElligible(candidate) {
              return candidate.kind === CARD_KINDS.SPELL && candidate.location === 'hand';
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(manaCostReduction);
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(manaCostReduction.id);
            }
          })
        ]
      })
    );
  },
  talentTree: {
    nodes: []
  }
};
