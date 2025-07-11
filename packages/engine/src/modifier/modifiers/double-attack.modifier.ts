import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.card';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { Modifier } from '../modifier.entity';

export class DoubleAttackModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  private hasAttackedThisturn = false;

  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.DOUBLE_ATTACK.id, game, source, {
      icon: 'keyword-double-attack',
      name: KEYWORDS.DOUBLE_ATTACK.name,
      description: KEYWORDS.DOUBLE_ATTACK.description,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: 'combat.after-resolve-combat',
          handler: async event => {
            if (!game.gamePhaseSystem.turnPlayer.equals(this.target.player)) return;

            if (!event.data.attacker.equals(this.target)) return;

            if (this.hasAttackedThisturn) return;

            if (event.data.attacker.isAlive) {
              await event.data.attacker.wakeUp();
              this.hasAttackedThisturn = true;
            }
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_END_TURN,
          handler: async () => {
            this.hasAttackedThisturn = false;
          }
        })
      ]
    });
  }
}
