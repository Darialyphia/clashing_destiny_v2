import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class HinderedModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private cost: number,
    options: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(`${KEYWORDS.HINDERED.id}_${cost}`, game, source, {
      isUnique: true,
      name:
        cost > 0
          ? `${KEYWORDS.HINDERED.name.replace('X', cost.toString())}`
          : KEYWORDS.HINDERED.name,
      description: KEYWORDS.HINDERED.description.replace('X', cost.toString()),
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.HINDERED),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;

            if (this.cost === 0) return;

            const player = this.target.player;
            const availableCards = player.cardManager.hand.filter(
              c => !c.equals(this.target) && c.canBeUsedAsManaCost
            ).length;

            if (availableCards < this.cost) {
              await this.target.exhaust();
              return;
            }

            // Ask player if they want to pay
            const answer = await game.interaction.askQuestion({
              player,
              source: this.target,
              questionId: `hindered-${this.target.id}`,
              label: `Pay @[mana] ${this.cost}@ to prevent @${this.target.blueprint.name}@ from being exhausted?`,
              choices: [
                { id: 'yes', label: `Yes, pay ${this.cost}` },
                { id: 'no', label: 'No, exhaust instead' }
              ],
              timeoutFallback: 'no'
            });

            if (answer === 'yes') {
              const cardsInHand = player.cardManager.hand.filter(
                c => !c.equals(this.target) && c.canBeUsedAsManaCost
              );

              const selectedCards = await game.interaction.chooseCards({
                player,
                choices: cardsInHand,
                minChoiceCount: this.cost,
                maxChoiceCount: this.cost,
                label: `Select ${this.cost} card(s) to pay for Hindered`,
                timeoutFallback: cardsInHand.slice(0, this.cost)
              });

              for (const card of selectedCards) {
                await card.sendToDestinyZone();
              }
            } else {
              await this.target.exhaust();
            }
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
