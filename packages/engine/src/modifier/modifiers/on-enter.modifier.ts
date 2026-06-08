import { KEYWORDS } from '../../card/card-keywords';
import { CARD_EVENTS } from '../../card/card.enums';
import { CardEffectTriggeredEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { OnEnterModifierMixin, type OnEnterHandler } from '../mixins/on-enter.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnEnterModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      handler: OnEnterHandler;
      mixins?: ModifierMixin<MinionCard>[];
      onlyWhenPlayedFromHand?: boolean;
    }
  ) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      mixins: [
        new OnEnterModifierMixin(game, {
          onlyWhenPlayedFromHand: options.onlyWhenPlayedFromHand,
          handler: async event => {
            await game.emit(
              CARD_EVENTS.CARD_EFFECT_TRIGGERED,
              new CardEffectTriggeredEvent({
                card: this.target,
                message: `${this.target.blueprint.name} triggered its On Enter effect.`
              })
            );
            await options.handler(event);
          }
        }),
        new KeywordModifierMixin(game, KEYWORDS.ON_ENTER),
        ...(options.mixins ?? [])
      ]
    });
  }
}
