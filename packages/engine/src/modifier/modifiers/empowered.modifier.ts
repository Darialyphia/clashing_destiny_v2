import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class EmpoweredModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<MinionCard>[] } = {}
  ) {
    super(KEYWORDS.EMPOWERED.id, game, source, {
      isUnique: true,
      name: KEYWORDS.EMPOWERED.name,
      description: KEYWORDS.EMPOWERED.description,
      icon: 'icons/keyword-double-cast',
      mixins: mixins ?? []
    });
  }
}
