import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Unit } from '../../unit/unit.entity';
import { AbilityDamage } from '../../utils/damage';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { Modifier } from '../modifier.entity';

export class BurnModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard, options: { stacks: number }) {
    super(KEYWORDS.BURN.id, game, card, {
      stacks: options.stacks,
      name: KEYWORDS.BURN.name,
      description: KEYWORDS.BURN.description,
      icon: 'icons/keyword-burn',
      isUnique: true,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.TURN_START,
          handler: async () => {
            await this.target.takeDamage(card, new AbilityDamage(card, this.stacks));
          }
        })
      ]
    });
  }
}
