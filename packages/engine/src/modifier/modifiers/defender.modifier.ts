import { BOARD_SLOT_ZONES } from '../../board/board.constants';
import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class DefenderModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.DEFENDER.id, game, source, {
      name: KEYWORDS.DEFENDER.name,
      description: KEYWORDS.DEFENDER.description,
      icon: `keyword-${KEYWORDS.DEFENDER.id}`,
      mixins: [
        new TogglableModifierMixin(game, () => {
          return (
            this.target.location === CARD_LOCATIONS.BOARD &&
            this.target.zone === BOARD_SLOT_ZONES.DEFENSE_ZONE
          );
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
