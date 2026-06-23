import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/card.enums';
import { CardAfterMoveEvent, CardEffectTriggeredEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { AfterDeclareAttackTargetEvent } from '../../game/systems/combat.system';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnMoveModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<MinionCard>[];
      handler: (event: CardAfterMoveEvent, modifier: Modifier<MinionCard>) => void;
      location?: 'base' | 'battlefield' | 'both';
    }
  ) {
    super(KEYWORDS.ON_MOVE.id, game, source, {
      name: KEYWORDS.ON_MOVE.name,
      description: KEYWORDS.ON_MOVE.description,
      icon: 'icons/keyword-on-move',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_MOVE),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_MOVE,
          filter: event => {
            if (!event.data.card.equals(this.target)) return false;
            if (this.options.location === 'base') {
              return event.data.to.position.zone === CARD_LOCATIONS.BASE;
            }
            if (this.options.location === 'battlefield') {
              return (
                event.data.to.position.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
                event.data.to.position.zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD
              );
            }
            return true;
          },
          handler: event => this.onMove(event)
        }),
        ...(options.mixins || [])
      ]
    });
  }

  private async onMove(event: CardAfterMoveEvent) {
    await this.game.emit(
      GAME_EVENTS.CARD_EFFECT_TRIGGERED,
      new CardEffectTriggeredEvent({
        card: this.target,
        message: `${this.target.blueprint.name} triggers its On Move effect.`
      })
    );
    await this.options.handler(event, this);
  }
}
