import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { SigilCard } from '../../card/entities/sigil.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class DrifterModifier<T extends MinionCard | SigilCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.DRIFTER.id, game, source, {
      name: KEYWORDS.DRIFTER.name,
      description: KEYWORDS.DRIFTER.description,
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.DRIFTER),
        new TogglableModifierMixin(
          game,
          () => this.target.location === CARD_LOCATIONS.BOARD
        ),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_START,
          handler: async () => {
            await this.target.move();
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
