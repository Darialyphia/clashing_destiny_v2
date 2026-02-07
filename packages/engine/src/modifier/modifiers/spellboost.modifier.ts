import type { MaybePromise } from '@game/shared';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { isSpell } from '../../card/card-utils';
import { CARD_LOCATIONS } from '../../card/card.enums';

export class SpellboostModifier<T extends AnyCard> extends Modifier<T> {
  private _spellBoostStacks = 0;

  constructor(
    game: Game,
    source: AnyCard,
    private options: {
      mixins?: ModifierMixin<T>[];
      onSpellboost?: () => MaybePromise<void>;
    }
  ) {
    super(KEYWORDS.SPELLBOOST.id, game, source, {
      name: KEYWORDS.SPELLBOOST.name,
      description: KEYWORDS.SPELLBOOST.description,
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SPELLBOOST),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_PLAY,
          filter: event => {
            if (!event.data.card.isAlly(this.target)) return false;
            return (
              isSpell(event.data.card) &&
              (this.target.location === CARD_LOCATIONS.HAND ||
                this.target.location === CARD_LOCATIONS.DESTINY_ZONE ||
                this.target.location === CARD_LOCATIONS.DESTINY_DECK)
            );
          },
          handler: async () => {
            this._spellBoostStacks += 1;
            await options.onSpellboost?.();
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
  get spellBoostStacks() {
    return this._spellBoostStacks;
  }

  async spellBoost() {
    this._spellBoostStacks += 1;
    await this.options.onSpellboost?.();
  }
}
