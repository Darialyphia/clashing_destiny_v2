import { KEYWORDS } from '../../card/card-keywords';
import { isSpell } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { UntilEndOfTurnModifierMixin } from '../mixins/until-end-of-turn.mixin';
import { UntilEventModifierMixin } from '../mixins/until-event';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { SimpleSpellpowerBuffModifier } from './simple-spellpower.buff.modifier';

export class EmpowerModifier extends Modifier<HeroCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<HeroCard>[] }
  ) {
    super(KEYWORDS.EMPOWER.id, game, source, {
      isUnique: true,
      stacks: options.amount,
      name: KEYWORDS.EMPOWER.name,
      description: KEYWORDS.EMPOWER.description,
      icon: 'keyword-empower-buff',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
          handler: async event => {
            if (!event.data.card.player.equals(this.target.player)) return;
            if (!isSpell(event.data.card)) return;

            await this.target.modifiers.add(
              new SimpleSpellpowerBuffModifier(
                `${KEYWORDS.EMPOWER.id}-${this.initialSource.id}`,
                game,
                this.initialSource,
                { amount: options.amount }
              )
            );
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
