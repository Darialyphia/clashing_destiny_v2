import { KEYWORDS } from '../../card/card-keywords';
import type { AbilityOwner } from '../../card/entities/ability.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { RemoveAbilitiesModifierMixin } from '../mixins/remove-abilities.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SilencedModifier<T extends AbilityOwner> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.SILENCED.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SILENCED),
        new RemoveAbilitiesModifierMixin(game),
        ...(options.mixins ?? [])
      ]
    });
  }
}
