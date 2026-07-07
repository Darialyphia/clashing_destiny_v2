import { KEYWORDS } from '../../card/card-keywords';
import { isMinion } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { CardAuraModifierMixin } from '../mixins/aura.mixin';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { WhileOnBattlefieldModifier } from './while-on-board.modifier';

export class TauntModifier extends WhileOnBattlefieldModifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[] } = {}
  ) {
    super(KEYWORDS.TAUNT.id, game, source, {
      name: KEYWORDS.TAUNT.name,
      description: KEYWORDS.TAUNT.description,
      icon: 'icons/keyword-taunt',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.TAUNT),

        new CardAuraModifierMixin<MinionCard>(game, source, {
          isElligible(candidate) {
            if (!isMinion(candidate)) return false;
            if (candidate.isAlly(source)) return false;
            if (candidate.location !== source.location) return false;
            return candidate.isOnBattlefield;
          },
          getModifiers() {
            return [
              new Modifier<MinionCard>('taunted', game, source, {
                mixins: [
                  new MinionInterceptorModifierMixin(game, {
                    key: 'canAttack',
                    interceptor: (value, { target }) => {
                      if (!value) return value;

                      return target.modifiers.has(TauntModifier);
                    }
                  })
                ]
              })
            ];
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
