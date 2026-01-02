import type { MaybePromise } from '@game/shared';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { Modifier } from '../modifier.entity';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import type { SigilCard } from '../../card/entities/sigil.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { HeroCard } from '../../card/entities/hero.entity';

export class WhileOnBoardModifier<
  T extends MinionCard | ArtifactCard | SigilCard | HeroCard
> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    source: AnyCard,
    private options: {
      mixins: Array<ModifierMixin<T>>;
    }
  ) {
    super(modifierType, game, source, {
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
