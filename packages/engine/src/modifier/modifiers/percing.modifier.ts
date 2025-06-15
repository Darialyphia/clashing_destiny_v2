import { KEYWORDS } from '../../card/card-keywords';
import { isMinion } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.card';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class PercingModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.PIERCING.id, game, source, {
      name: KEYWORDS.PIERCING.name,
      description: KEYWORDS.PIERCING.description,
      icon: 'keyword-piercing',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RUSH),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;
            if (!isMinion(event.data.target)) return;
            const behind = event.data.target.slot?.behind?.minion;
            await behind?.takeDamage(this.target, event.data.damage);
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            console.log(event.data);
            if (!event.data.card.equals(this.target)) return;
            if (!isMinion(event.data.target)) return;
            const behind = event.data.target.slot?.behind?.minion;
            await behind?.takeDamage(this.target, event.data.damage);
          }
        })
      ]
    });
  }
}
