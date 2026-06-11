import type { MinionCard } from '../../card/entities/minion.entity';
import { WhileOnBattlefieldModifier } from './while-on-board.modifier';
import { KEYWORDS } from '../../card/card-keywords';
import type { ModifierMixin } from '../modifier-mixin';
import { isFunction } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GrantAbilityModifierMixin } from '../mixins/grant-ability.mixin';
import { COMBAT_STEPS } from '../../game/game.enums';
import { noTargets } from '../../card/card-utils';
import { SimplePowerBuffModifier } from './simple-power-buff.modifier';
import { UntilEventModifierMixin } from '../mixins/until-event';
import { GAME_EVENTS } from '../../game/game.events';

export class AssistModifier extends WhileOnBattlefieldModifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      amount: number | (() => number);
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.ASSIST.id, game, source, {
      isUnique: true,
      icon: 'icons/keyword-assist',
      name: KEYWORDS.ASSIST.name,
      description: KEYWORDS.ASSIST.description,
      mixins: [
        new GrantAbilityModifierMixin(game, {
          id: 'assist',
          label: KEYWORDS.ASSIST.name,
          description: KEYWORDS.ASSIST.description,
          canUse: () => {
            if (this.game.combatSystem.state !== COMBAT_STEPS.REACTION) return false;
            const attacker = this.game.combatSystem.attacker!;
            return !attacker.equals(this) && attacker.isAlly(this.target);
          },
          getTargets: async () => ({
            cancelled: false,
            result: {
              spaces: [],
              cards: [game.combatSystem.attacker!]
            }
          }),
          manaCost: 0,
          shoouldExhaust: true,
          isHiddenOnCard: true,
          onResolve: async (game, card, targets) => {
            const amount = isFunction(options.amount) ? options.amount() : options.amount;

            await targets.cards[0].modifiers.add(
              new SimplePowerBuffModifier('assis', game, card, {
                amount,
                mixins: [
                  new UntilEventModifierMixin(game, {
                    eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT
                  })
                ]
              })
            );
          },
          aiHints: {
            shouldUse: () => 1
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
