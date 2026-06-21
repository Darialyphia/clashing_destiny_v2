import { isFunction } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { isMinion, singleMinionTargetRules } from '../../card/card-utils';
import { AbilityDamage } from '../../utils/damage';
import { CardEffectTriggeredEvent } from '../../card/card.events';

export class BlastModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    card: MinionCard,
    options: { amount: number | (() => number); mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.BLAST.id, game, card, {
      isUnique: true,
      name: KEYWORDS.BLAST.name,
      description: KEYWORDS.BLAST.description,
      icon: 'icons/keyword-blast',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BLAST),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_BEFORE_DESTROY,
          filter: event => event.data.card.equals(this.target),
          handler: async () => {
            const amount = isFunction(options.amount) ? options.amount() : options.amount;
            if (amount === 0) return;

            const elligibleTargets = (this.target.position?.opponentZone ?? [])
              .filter(space => !space.isEmpty)
              .map(space => space.card)
              .filter(c => isMinion(c!))
              .filter(c => c.isAlive);
            if (elligibleTargets.length === 0) return;

            await game.emit(
              GAME_EVENTS.CARD_EFFECT_TRIGGERED,
              new CardEffectTriggeredEvent({
                card: this.target,
                message: `${this.target.blueprint.name} deals ${amount} blast damage to an enemy minion`
              })
            );

            const result = await singleMinionTargetRules.getTargets({
              game,
              card: this.target,
              timeoutFallback: [elligibleTargets[0]],
              canCancel: false,
              aiHints: {
                shouldPick: () => 1
              }
            });

            if (result.cancelled) return;

            for (const minion of result.result.cards) {
              await minion.takeDamage(this.target, new AbilityDamage(amount));
            }
          }
        })
      ]
    });
  }
}
