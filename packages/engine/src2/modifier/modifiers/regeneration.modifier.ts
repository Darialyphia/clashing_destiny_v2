import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Unit } from '../../unit/unit.entity';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { Modifier } from '../modifier.entity';

export class RegenerationModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard, options: { stacks: number }) {
    super(KEYWORDS.REGENERATION.id, game, card, {
      stacks: options.stacks,
      name: KEYWORDS.REGENERATION.name,
      description: KEYWORDS.REGENERATION.description,
      icon: 'icons/keyword-regeneration',
      isUnique: true,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_START,
          handler: async () => {
            await this.target.heal(card, this.stacks);
          }
        })
      ]
    });
  }
}
