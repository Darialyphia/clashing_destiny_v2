import type { Nullable } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import { isMinion } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { PiercingAOE } from '../../card/attack-aoe';

export class PiercingModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.PIERCING.id, game, source, {
      name: KEYWORDS.PIERCING.name,
      description: KEYWORDS.PIERCING.description,
      icon: 'keyword-piercing',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PIERCING),
        new UnitInterceptorModifierMixin(game, {
          key: 'attackAOEs',
          interceptor: value => {
            return [...value, new PiercingAOE()];
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
