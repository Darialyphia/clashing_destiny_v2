import { KEYWORDS } from '../../card/card-keywords';
import { CARD_KINDS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { CombatDamage, DAMAGE_TYPES } from '../../utils/damage';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { WhileOnBoardModifier } from './while-on-board.modifier';

export class ProtectorModifier<T extends MinionCard> extends WhileOnBoardModifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins?: Array<ModifierMixin<T>> }
  ) {
    super(KEYWORDS.PROTECTOR.id, game, source, {
      name: KEYWORDS.PROTECTOR.name,
      description: KEYWORDS.PROTECTOR.description,
      icon: 'icons/keyword-provoke',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROTECTOR),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_BEFORE_TAKE_DAMAGE,
          filter: event => {
            return !!(
              event.data.damage.type === DAMAGE_TYPES.COMBAT &&
              this.game.combatSystem.defender?.equals(event.data.card) &&
              this.target.position
                .getAdjacentCardsOfKind(CARD_KINDS.MINION)
                .filter(minion => minion.isAlly(this.target))
                .some(minion => minion.equals(event.data.card))
            );
          },
          handler: async event => {
            event.data.damage.prevent();
            await this.target.takeDamage(
              event.data.card,
              new CombatDamage((event.data.damage as CombatDamage).attacker)
            );
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
