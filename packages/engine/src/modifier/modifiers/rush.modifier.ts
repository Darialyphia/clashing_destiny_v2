import { askMandatoryYesNoQuestion } from '../../card/card-actions-utils';
import { KEYWORDS } from '../../card/card-keywords';
import { CardEffectTriggeredEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class RushModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { cost: number; mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super('rush', game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RUSH),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_SUMMONED,
          filter: event => event.data.card.equals(this.target),
          handler: async () => {
            if (this.target.player.mana < options.cost) return;

            const shouldRush =
              options.cost > 0
                ? await askMandatoryYesNoQuestion({
                    aiChoice: 'yes',
                    game,
                    card: this.target,
                    label: `Pay ${options.cost} mana to wake up this minion?`,
                    questionId: 'rush-activation',
                    timeoutFallback: 'yes'
                  })
                : true;

            if (!shouldRush) return;

            await game.emit(
              GAME_EVENTS.CARD_EFFECT_TRIGGERED,
              new CardEffectTriggeredEvent({
                card: this.target,
                message: `${this.target.blueprint.name} Rush activated.`
              })
            );

            await this.target.player.manaManager.spend(options.cost);
            await this.target.wakeUp();
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
