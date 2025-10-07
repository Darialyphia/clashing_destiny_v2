import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class VigilantModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<T>[] } = { mixins: [] }
  ) {
    super(KEYWORDS.VIGILANT.id, game, source, {
      icon: 'keyword-vigilant',
      name: KEYWORDS.VIGILANT.name,
      description: KEYWORDS.VIGILANT.description,
      isUnique: true,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
          handler: async event => {
            if (!event.data.target.equals(this.target)) return;

            if (event.data.target.isAlive) {
              await event.data.target.wakeUp();
            }
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
