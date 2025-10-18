import { KEYWORDS } from '../../card/card-keywords';
import { CardEffectTriggeredEvent } from '../../card/card.events';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { AfterDeclareAttackEvent } from '../../game/phases/combat.phase';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnAttackModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<T>[];
      handler: (event: AfterDeclareAttackEvent, modifier: Modifier<T>) => void;
    }
  ) {
    super(KEYWORDS.ON_ATTACK.id, game, source, {
      name: KEYWORDS.ON_ATTACK.name,
      description: KEYWORDS.ON_ATTACK.description,
      icon: 'keyword-on-attack',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_ATTACK),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.AFTER_DECLARE_ATTACK,
          handler: event => this.onDamage(event)
        }),
        ...(options.mixins || [])
      ]
    });
  }

  private async onDamage(event: AfterDeclareAttackEvent) {
    if (!event.data.attacker.equals(this.target)) return;
    await this.game.emit(
      GAME_EVENTS.CARD_EFFECT_TRIGGERED,
      new CardEffectTriggeredEvent({
        card: this.target,
        message: `${this.target.blueprint.name} triggers its On Attack effect.`
      })
    );
    await this.options.handler(event, this);
  }
}
