import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/components/card-manager.component';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class LingeringDestinyModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<T>[] } = { mixins: [] }
  ) {
    super(KEYWORDS.LINGERING_DESTINY.id, game, source, {
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_CHANGE_LOCATION,
          filter: event => event.data.card.equals(this.target),
          handler: async event => {
            if (event.data.to === CARD_LOCATIONS.DISCARD_PILE) {
              const spark = await this.target.player.generateCard('mana-spark');
              await spark.sendToDestinyZone();
            }
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
