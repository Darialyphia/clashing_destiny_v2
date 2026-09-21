import { KEYWORDS } from '../../card/card-keywords';
import type { AbilityOwner } from '../../card/entities/ability.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { CardAuraModifierMixin } from '../mixins/aura.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { WhileOnBoardModifier } from './while-on-board.modifier';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { isMinion } from '../../card/card-utils';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';

export class ProtectorModifier<T extends AbilityOwner> extends WhileOnBoardModifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.PROTECTOR.id, game, source, {
      name: KEYWORDS.PROTECTOR.name,
      description: KEYWORDS.PROTECTOR.description,
      icon: 'icons/keyword-protector',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROTECTOR),
        new CardAuraModifierMixin(game, source, {
          isElligible: candidate => {
            return (
              !candidate.equals(this.target) &&
              isMinion(candidate) &&
              candidate.isAlly(this.target) &&
              candidate.location === this.target.location
            );
          },
          getModifiers: candidate => {
            return [
              new Modifier<MinionCard>('protector-aura', game, this.target, {
                mixins: [
                  new MinionInterceptorModifierMixin(game, {
                    key: 'canBeAttacked',
                    interceptor: value => {
                      if (!value) return value;

                      return candidate.modifiers.has(ProtectorModifier);
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
