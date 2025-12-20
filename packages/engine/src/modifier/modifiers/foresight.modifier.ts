import { KEYWORDS } from '../../card/card-keywords';
import { CARD_DECK_SOURCES, CARD_SPEED } from '../../card/card.enums';
import type { AbilityOwner } from '../../card/entities/ability.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GrantAbilityModifierMixin } from '../mixins/grant-ability.mixin';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../mixins/until-end-of-turn.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class ForesightModifier<T extends AbilityOwner> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.FORESIGHT.id, game, source, {
      isUnique: true,
      mixins: [
        new GrantAbilityModifierMixin(game, {
          id: KEYWORDS.FORESIGHT.id,
          description:
            'Banish this card from your Discard pile, and a card in your Destiny Zone. Reduce the cost of the next Destiny card you play this turn by 1.',
          label: 'Foresight',
          manaCost: 0,
          runeCost: {},
          shouldExhaust: false,
          speed: CARD_SPEED.BURST,
          isHiddenOnCard: true,
          canUse: (game, card) => {
            if (card.location !== 'discardPile') return false;
            return card.player.cardManager.destinyZone.size > 0;
          },
          async getPreResponseTargets(game, card) {
            const [cardToBanish] = await game.interaction.chooseCards({
              player: card.player,
              label: 'Select this card to banish',
              minChoiceCount: 1,
              maxChoiceCount: 1,
              choices: Array.from(card.player.cardManager.destinyZone)
            });
            return [cardToBanish];
          },
          async onResolve(game, card, targets) {
            await card.sendToBanishPile;
            const [target] = targets;
            await target.sendToBanishPile();

            for (const destinyCard of card.player.cardManager.destinyDeck.cards) {
              await destinyCard.modifiers.add(
                new Modifier<AnyCard>('foresight-cost-reduction', game, card, {
                  mixins: [
                    new CardInterceptorModifierMixin(game, {
                      key: 'destinyCost',
                      interceptor: (val, ctx, modifier) =>
                        Math.max(0, (val ?? 0) - modifier.stacks)
                    }),
                    new UntilEndOfTurnModifierMixin(game),
                    new GameEventModifierMixin(game, {
                      eventName: GAME_EVENTS.CARD_AFTER_PLAY,
                      async handler(event, modifier) {
                        if (!event.data.card.player.equals(destinyCard.player)) return;
                        if (event.data.card.deckSource !== CARD_DECK_SOURCES.DESTINY_DECK)
                          return;

                        await modifier.remove();
                      }
                    })
                  ]
                })
              );
            }
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
