import { BOARD_SLOT_ZONES } from '../../board/board.constants';
import { RangedAttackRange } from '../../card/attack-range';
import { KEYWORDS } from '../../card/card-keywords';
import { isHero } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class RangedModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.RANGED.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RANGED),
        new MinionInterceptorModifierMixin(game, {
          key: 'canBeCounterattacked',
          interceptor: (value, { defender }) => {
            if (this.target.position?.zone === BOARD_SLOT_ZONES.FRONT_ROW) return value;
            if (isHero(defender)) return value;
            if (defender.modifiers.has(RangedModifier)) return value;
            return false;
          }
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'attackRanges',
          interceptor: value => {
            return [...value, new RangedAttackRange(game, this.target)];
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
