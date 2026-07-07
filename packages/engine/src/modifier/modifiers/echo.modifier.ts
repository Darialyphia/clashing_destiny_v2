import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class EchoModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.ECHO.id, game, source, {
      isUnique: true,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
          filter: event => {
            return !!event?.data?.card.equals(this.target);
          },
          handler: async event => {
            const clone = await this.target.player.generateCard(
              this.target.blueprintId,
              this.target.isFoil
            );

            await clone.modifiers.remove(EchoModifier);
            await clone.addToHand();
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
