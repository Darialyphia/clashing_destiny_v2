import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UntilEventModifierMixin } from '../mixins/until-event';
import { Modifier } from '../modifier.entity';

export class EphemeralModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.EPHEMERAL.id, game, source, {
      name: KEYWORDS.EPHEMERAL.name,
      description: KEYWORDS.EPHEMERAL.description,
      isUnique: true,
      icon: 'icons/keyword-ephemeral',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.EPHEMERAL),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_END,
          handler: async () => {
            if (
              this.target.location === CARD_LOCATIONS.BASE ||
              this.target.location === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
              this.target.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD
            ) {
              await this.target.sendToBanishPile();
            }
          }
        }),
        new UntilEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_START
        })
      ]
    });
  }
}
