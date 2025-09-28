import { KEYWORDS } from '../../card/card-keywords';
import { CARD_EVENTS } from '../../card/card.enums';
import { CardEffectTriggeredEvent } from '../../card/card.events';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { OnEnterModifierMixin, type OnEnterHandler } from '../mixins/on-enter.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnEnterModifier<
  T extends MinionCard | ArtifactCard | HeroCard
> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { handler: OnEnterHandler<T>; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      mixins: [
        new OnEnterModifierMixin<T>(game, async event => {
          await options.handler(event);
          await game.emit(
            CARD_EVENTS.CARD_EFFECT_TRIGGERED,
            new CardEffectTriggeredEvent({ card: this.target })
          );
        }),
        new KeywordModifierMixin(game, KEYWORDS.ON_ENTER),
        ...(options.mixins ?? [])
      ]
    });
  }
}
