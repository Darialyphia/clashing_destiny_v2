import { KEYWORDS } from '../../card/card-keywords';
import { isSpell } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero-card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { CardAuraModifierMixin } from '../mixins/aura.mixin';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../mixins/until-end-of-turn.mixin';
import { UntilEventModifierMixin } from '../mixins/until-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class EmpowerModifier extends Modifier<HeroCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<HeroCard>[] }
  ) {
    super(`${KEYWORDS.EMPOWER.id}-${source.id}`, game, source, {
      isUnique: true,
      stacks: options.amount,
      name: KEYWORDS.EMPOWER.name,
      description: KEYWORDS.EMPOWER.description,
      icon: 'keyword-empower-buff',
      groupKey: 'empower',
      mixins: [
        new CardAuraModifierMixin(game, source.player.hero, {
          isElligible(candidate) {
            return candidate.player.equals(source.player) && isSpell(candidate);
          },
          getModifiers: () => {
            return [
              new Modifier('empower-level-bonus-aura', game, source, {
                mixins: [
                  new CardInterceptorModifierMixin(game, {
                    key: 'playerLevel',
                    interceptor: value => value + this.stacks
                  })
                ]
              })
            ];
          }
        }),
        new UntilEndOfTurnModifierMixin(game),
        new UntilEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
          filter: event => {
            if (event.data.card.equals(source)) return false;
            if (!event.data.card.player.equals(this.target.player)) return false;
            if (!isSpell(event.data.card)) return false;

            return true;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
