import { KEYWORDS } from '../../card/card-keywords';
import { CardEffectTriggeredEvent, CardScoreEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnScoreModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<MinionCard>[];
      handler: (event: CardScoreEvent, modifier: Modifier<MinionCard>) => void;
    }
  ) {
    super(KEYWORDS.ON_SCORE.id, game, source, {
      name: KEYWORDS.ON_SCORE.name,
      description: KEYWORDS.ON_SCORE.description,
      icon: 'icons/keyword-on-attack',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_SCORE),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.BEFORE_SCORE,
          filter: event => event.data.card.equals(this.target),
          handler: event => this.onScore(event)
        }),
        ...(options.mixins || [])
      ]
    });
  }

  private async onScore(event: CardScoreEvent) {
    console.log('on score');
    await this.game.emit(
      GAME_EVENTS.CARD_EFFECT_TRIGGERED,
      new CardEffectTriggeredEvent({
        card: this.target,
        message: `${this.target.blueprint.name} triggered its On Score effect.`
      })
    );
    await this.options.handler(event, this);
  }
}
