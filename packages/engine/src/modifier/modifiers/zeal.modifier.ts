import { KEYWORDS } from '../../card/card-keywords';
import { CardEffectTriggeredEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { UntilEndOfTurnModifierMixin } from '../mixins/until-end-of-turn.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';
import { WhileOnBoardModifier } from './while-on-board.modifier';

export class ZealModifier extends WhileOnBoardModifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<MinionCard>[];
      zealedModifiers: Modifier<MinionCard>[];
    }
  ) {
    super(KEYWORDS.ZEAL.id, game, source, {
      name: KEYWORDS.ZEAL.name,
      description: KEYWORDS.ZEAL.description,
      icon: 'icons/keyword-zeal',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
          frequencyPerGameTurn: 1,
          filter: event =>
            event.data.card.isAlly(this.target) &&
            !event.data.card.equals(this.target) &&
            event.data.card.location === this.target.location,
          handler: async () => {
            await this.game.emit(
              GAME_EVENTS.CARD_EFFECT_TRIGGERED,
              new CardEffectTriggeredEvent({
                card: this.target,
                message: `${this.target.blueprint.name} is zealed!`
              })
            );
            for (const modifier of options.zealedModifiers) {
              modifier.addMixin(new UntilEndOfTurnModifierMixin(game));
              await this.target.modifiers.add(modifier);
            }
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
