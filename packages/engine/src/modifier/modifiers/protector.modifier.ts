import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import { HeroCard } from '../../card/entities/hero.entity';
import { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { CardAuraModifierMixin } from '../mixins/aura.mixin';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';
import { WhileOnBoardModifier } from './while-on-board.modifier';

export class ProtectorModifier<
  T extends MinionCard | HeroCard
> extends WhileOnBoardModifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.PROTECTOR.id, game, source, {
      name: KEYWORDS.PROTECTOR.name,
      description: KEYWORDS.PROTECTOR.description,
      icon: 'icons/keyword-provoke',
      mixins: [
        new CardAuraModifierMixin(game, source, {
          isElligible: candidate => {
            return (
              candidate.isAlly(this.target) &&
              !candidate.equals(this.target) &&
              candidate.location === CARD_LOCATIONS.BOARD
            );
          },
          getModifiers(candidate) {
            return [
              new Modifier('protector-aura', game, source, {
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
        })
      ]
    });
  }
}
