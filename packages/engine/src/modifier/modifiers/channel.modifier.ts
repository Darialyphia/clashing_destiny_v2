import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { WhileOnBoardModifier } from './while-on-board.modifier';
import type { ModifierMixin } from '../modifier-mixin';
import { CardEffectTriggeredEvent } from '../../card/card.events';

export class ChannelModifier<T extends MinionCard> extends WhileOnBoardModifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    options: {
      handler: () => MaybePromise<void>;
      mixins?: Array<ModifierMixin<T>>;
    }
  ) {
    super(modifierType, game, source, {
      name: KEYWORDS.CHANNEL.name,
      description: KEYWORDS.CHANNEL.description,
      icon: 'icons/keyword-channel',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.CHANNEL),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_END,
          filter: () => {
            return !this.target.isExhausted;
          },
          handler: async () => {
            await this.game.emit(
              GAME_EVENTS.CARD_EFFECT_TRIGGERED,
              new CardEffectTriggeredEvent({
                card: this.target,
                message: `${this.target.blueprint.name} Channel effect triggered`
              })
            );
            await options.handler();
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
