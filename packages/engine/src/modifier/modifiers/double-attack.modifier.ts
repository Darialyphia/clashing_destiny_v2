import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { CombatDamage } from '../../utils/damage';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { WhileOnBoardModifier } from './while-on-board.modifier';

export class DoubleAttackModifier extends WhileOnBoardModifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[] } = { mixins: [] }
  ) {
    super(KEYWORDS.DOUBLE_ATTACK.id, game, source, {
      icon: 'icons/keyword-double-attack',
      name: KEYWORDS.DOUBLE_ATTACK.name,
      description: KEYWORDS.DOUBLE_ATTACK.description,
      isUnique: true,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
          handler: async event => {
            if (!event.data.attacker.equals(this.target)) return;

            if (event.data.attacker.isAlive && event.data.target.isAlive) {
              await event.data.attacker.dealDamage(
                event.data.target,
                new CombatDamage(event.data.attacker),
                true
              );
            }
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
