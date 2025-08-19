import type { BetterExtract } from '@game/shared';
import { GAME_EVENTS } from '../../../../game/game.events';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilStartOfNextOwnTurnModifierMixin } from '../../../../modifier/mixins/until-start-of-next-own-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { DestinyBlueprint } from '../../../card-blueprint';
import { isMinionOrHero } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { DestinyCard } from '../../../entities/destiny.entity';
import type { GamePhase } from '../../../../game/game.enums';

export const mercyForTheInjured: DestinyBlueprint = {
  id: 'mercy-for-the-injured',
  name: 'Mercy for the Injured',
  cardIconId: 'talent-mercy-for-the-injured',
  description: '',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  minLevel: 2,
  countsAsLevel: true,
  abilities: [
    {
      id: 'mercy-for-the-injured-ability',
      label: 'Pay for Attacks',
      description:
        '@[exhaust]@ @[mana] 2@ : Can only be used during your turn. Until the start of your next turn, players must pay @[mana] 2@ when they declare an attack. @Seal@ this ability.',
      manaCost: 2,
      shouldExhaust: true,
      canUse: () => true,
      getPreResponseTargets: async () => [],
      async onResolve(game, card, targets, ability) {
        ability.seal();
        const TAX_ATTACK_MODIFIER = 'mercy-or-the-injured-tax-attack';
        await card.modifiers.add(
          new Modifier<DestinyCard>('mercy-for-the-injured-aura', game, card, {
            mixins: [
              new UntilStartOfNextOwnTurnModifierMixin(game),
              new AuraModifierMixin(game, {
                canSelfApply: false,
                isElligible(candidate) {
                  return isMinionOrHero(candidate);
                },
                async onGainAura(candidate) {
                  await candidate.modifiers.add(
                    new Modifier(TAX_ATTACK_MODIFIER, game, card, {
                      mixins: [
                        new UnitInterceptorModifierMixin(game, {
                          key: 'canAttack',
                          interceptor: value => {
                            if (!value) return value;
                            return (
                              candidate.player.cardManager.hand.filter(
                                card => card.canBeUsedAsDestinyCost
                              ).length >= 2
                            );
                          }
                        })
                      ]
                    })
                  );
                },
                async onLoseAura(candidate) {
                  await candidate.modifiers.remove(TAX_ATTACK_MODIFIER);
                }
              }),
              new GameEventModifierMixin(game, {
                eventName: GAME_EVENTS.AFTER_DECLARE_ATTACK,
                async handler(event) {
                  if (event.data.attacker.player.cardManager.hand.length < 2) {
                    const ctx =
                      game.gamePhaseSystem.getContext<
                        BetterExtract<GamePhase, 'attack_phase'>
                      >();

                    await ctx.ctx.cancelAttack();
                    return;
                  }

                  const selectedCards = await game.interaction.chooseCards({
                    player: event.data.attacker.player,
                    label: 'Select cards to pay for the attack',
                    minChoiceCount: 2,
                    maxChoiceCount: 2,
                    choices: event.data.attacker.player.cardManager.hand
                  });

                  for (const selectedCard of selectedCards) {
                    selectedCard.sendToDestinyZone();
                  }
                }
              })
            ]
          })
        );
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
