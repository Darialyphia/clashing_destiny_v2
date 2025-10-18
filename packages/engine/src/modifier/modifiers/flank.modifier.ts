import { BOARD_SLOT_ZONES } from '../../board/board.constants';
import { FlankAttackRange, RangedAttackRange } from '../../card/attack-range';
import { KEYWORDS } from '../../card/card-keywords';
import { isHero } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class FlankModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.FLANK.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.FLANK),
        new MinionInterceptorModifierMixin(game, {
          key: 'attackRanges',
          interceptor: value => {
            return [...value, new FlankAttackRange(game, this.target)];
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
