import { KEYWORDS } from '../../card/card-keywords';
import { CARD_SPEED } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GrantAbilityModifierMixin } from '../mixins/grant-ability.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';
import type { BetterExtract } from '@game/shared';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { AbilityDamage, Damage, DAMAGE_TYPES } from '../../utils/damage';
import { CardEffectTriggeredEvent } from '../../card/card.events';

export class ProtectorModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.PROTECTOR.id, game, source, {
      name: KEYWORDS.PROTECTOR.name,
      description: KEYWORDS.PROTECTOR.description,
      icon: 'keyword-protector',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROTECTOR),
        new TogglableModifierMixin(
          game,
          () => this.target.location === 'board' && !this.target.isExhausted
        ),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_BEFORE_TAKE_DAMAGE,
          handler: async event => {
            if (event.data.damage.type !== DAMAGE_TYPES.COMBAT) return;
            const minion = this.target;
            const adjacentMinions = minion.slot!.adjacentMinions.filter(m =>
              m.isAlly(minion)
            );
            if (!adjacentMinions.some(m => m.equals(event.data.card))) return;
            await game.emit(
              GAME_EVENTS.CARD_EFFECT_TRIGGERED,
              new CardEffectTriggeredEvent({
                card: minion,
                message: `${minion.blueprint.name} protects ${event.data.card.blueprint.name} from damage.`
              })
            );
            event.data.damage.prevent();
            await minion.takeDamage(
              event.data.source,
              new AbilityDamage(event.data.damage.baseAmount)
            );
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
