import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { FleetingModifier } from './fleeting.modifier';

export class EchoModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.ECHO.id, game, source, {
      isUnique: true,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;
            const copy = await this.target.player.generateCard(this.target.blueprintId);
            await copy.modifiers.remove(KEYWORDS.ECHO.id);
            await copy.modifiers.add(new FleetingModifier(game, this.target));
            await copy.addToHand();
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
