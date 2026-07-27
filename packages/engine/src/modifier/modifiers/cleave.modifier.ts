import { isFunction, isDefined } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import { isMinion } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { CardEffectTriggeredEvent } from '../../card/card.events';
import { AbilityDamage } from '../../utils/damage';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class CleaveModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number | (() => number); mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.CLEAVE.id, game, source, {
      isUnique: true,
      name: KEYWORDS.CLEAVE.name,
      description: KEYWORDS.CLEAVE.description,
      icon: 'icons/keyword-cleave',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.CLEAVE),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE,
          filter: event => event.data.card.equals(this.target),
          handler: async () => {
            const amount = isFunction(options.amount) ? options.amount() : options.amount;
            if (amount === 0) return;

            const battlefield = this.target.battlefield;
            if (!battlefield) return;

            const targets = battlefield.allSpaces
              .map(space => space.card)
              .filter(isDefined)
              .filter(isMinion)
              .filter(c => !c.equals(this.target))
              .filter(c => c.isAlive);

            if (targets.length === 0) return;

            await game.emit(
              GAME_EVENTS.CARD_EFFECT_TRIGGERED,
              new CardEffectTriggeredEvent({
                card: this.target,
                message: `${this.target.blueprint.name} deals ${amount} cleave damage to all other minions on the battlefield`
              })
            );

            for (const minion of targets) {
              await minion.takeDamage(this.target, new AbilityDamage(amount));
            }
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
