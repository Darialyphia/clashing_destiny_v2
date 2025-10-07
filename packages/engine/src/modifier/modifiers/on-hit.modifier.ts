import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroAfterDealCombatDamageEvent } from '../../card/entities/hero.entity';
import type { MinionCardAfterDealCombatDamageEvent } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnHitModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<T>[];
      handler: (
        event: MinionCardAfterDealCombatDamageEvent | HeroAfterDealCombatDamageEvent,
        modifier: Modifier<T>
      ) => void;
    }
  ) {
    super(KEYWORDS.ON_HIT.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_HIT),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE,
          handler: event => this.onDamage(event)
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
          handler: event => this.onDamage(event)
        }),
        ...(options.mixins || [])
      ]
    });
  }

  private async onDamage(
    event: MinionCardAfterDealCombatDamageEvent | HeroAfterDealCombatDamageEvent
  ) {
    if (!event.data.card.equals(this.target)) return;
    if (event.data.target.isAttacking) return;
    await this.options.handler(event, this);
  }
}
