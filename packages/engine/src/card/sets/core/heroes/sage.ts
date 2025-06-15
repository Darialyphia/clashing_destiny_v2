import { GAME_EVENTS } from '../../../../game/game.events';
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
  description: 'Reduce the cost of spells in your hand by your @[spellpower]@.',
  level: 3,
  destinyCost: 3,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.COSMIC, AFFINITIES.ARCANE, AFFINITIES.CHRONO],
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
        '@[exhaust]@ @[mana] 1@Add a @Fleeting@ copy of the next spell you cast this turn. It costs @[mana] 1@. You can only activate this ability unless you have at least 4@[spellpower]@',
      canUse(game, card) {
        return card.player.hero.spellPower >= 4;
      },
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      shouldExhaust: true,
      async onResolve(game, card) {
        const stop = game.on(GAME_EVENTS.CARD_AFTER_PLAY, async event => {
          if (event.data.card.kind !== CARD_KINDS.SPELL) return;
          if (!event.data.card.player.equals(card.player)) return;
          stop();
          const copy = await card.player.generateCard<SpellCard>(card.blueprint.id);
          await copy.modifiers.add(
            new Modifier('double-cast', game, card, {
              mixins: [
                new SpellInterceptorModifierMixin(game, {
                  key: 'manaCost',
                  interceptor() {
                    return 1;
                  }
                })
              ]
            })
          );
          await card.player.cardManager.addToHand(copy);
        });
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
            return Math.max(value! - 1, 0);
          }
        })
      ]
    });
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('sage-spell-cost-reduction', game, card, {
        icon: 'modifier-double-cast',
        name: 'One with the magic',
        description: 'Reduce the cost of spells in your hand by your spellpower.',
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
  }
};
