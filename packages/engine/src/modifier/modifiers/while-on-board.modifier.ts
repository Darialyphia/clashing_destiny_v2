import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { Game } from '../../game/game';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { HeroCard } from '../../card/entities/hero.entity';

type WhileOnBoardOptions<T extends MinionCard | ArtifactCard> = {
  isUnique?: boolean;
  mixins: Array<ModifierMixin<T>>;
  name?: string | (() => string);
  description?: string | (() => string);
  icon?: string | (() => string);
};
export class WhileOnBoardModifier<
  T extends MinionCard | ArtifactCard
> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    private options: WhileOnBoardOptions<T>
  ) {
    super(modifierType, game, source, {
      isUnique: options.isUnique,
      name: options.name,
      description: options.description,
      icon: options.icon,
      mixins: [
        new TogglableModifierMixin(
          game,
          () =>
            this.target.location === CARD_LOCATIONS.BASE ||
            this.target.location === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
            this.target.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD
        ),
        ...options.mixins
      ]
    });
  }
}

export class WhileOnBaseModifier<
  T extends MinionCard | ArtifactCard
> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    options: WhileOnBoardOptions<T>
  ) {
    super(modifierType, game, source, {
      mixins: [
        new TogglableModifierMixin(
          game,
          () => this.target.location === CARD_LOCATIONS.BASE
        ),
        ...options.mixins
      ]
    });
  }
}

export class WhileOnBattlefieldModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    options: WhileOnBoardOptions<T>
  ) {
    super(modifierType, game, source, {
      name: options.name,
      description: options.description,
      icon: options.icon,
      mixins: [
        new TogglableModifierMixin(
          game,
          () =>
            this.target.location === CARD_LOCATIONS.LEFT_BATTLEFIELD ||
            this.target.location === CARD_LOCATIONS.RIGHT_BATTLEFIELD
        ),
        ...options.mixins
      ]
    });
  }
}
