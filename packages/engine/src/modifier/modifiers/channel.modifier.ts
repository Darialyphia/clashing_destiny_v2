import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import { CARD_KINDS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { CombatDamage, DAMAGE_TYPES } from '../../utils/damage';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { WhileOnBoardModifier } from './while-on-board.modifier';
import type { ModifierMixin } from '../modifier-mixin';

export class ChannelModifier<T extends MinionCard> extends WhileOnBoardModifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      handler: () => MaybePromise<void>;
      mixins?: Array<ModifierMixin<T>>;
    }
  ) {
    super(KEYWORDS.CHANNEL.id, game, source, {
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
            await options.handler();
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
