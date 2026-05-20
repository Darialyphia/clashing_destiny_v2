import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { HeroCard } from '../../card/entities/hero.entity';

export class WhileOnBoardModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    private options: {
      mixins: Array<ModifierMixin<T>>;
      name?: string | (() => string);
      description?: string | (() => string);
      icon?: string | (() => string);
    }
  ) {
    super(modifierType, game, source, {
      name: options.name,
      description: options.description,
      icon: options.icon,
      mixins: [
        new TogglableModifierMixin(
          game,
          () => this.target.location === CARD_LOCATIONS.BOARD
        ),
        ...options.mixins
      ]
    });
  }
}
