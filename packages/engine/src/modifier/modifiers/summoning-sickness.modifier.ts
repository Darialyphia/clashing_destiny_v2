import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { UntilEndOfTurnModifierMixin } from '../mixins/until-end-of-turn.mixin';
import { Modifier } from '../modifier.entity';

export class SummoningSicknessModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.SUMMONING_SICKNESS.id, game, source, {
      name: KEYWORDS.SUMMONING_SICKNESS.name,
      description: KEYWORDS.SUMMONING_SICKNESS.description,
      icon: 'icons/keyword-summoning-sickness',
      mixins: [new UntilEndOfTurnModifierMixin(game)]
    });
  }
}
