import { BOARD_SLOT_ZONES } from '../../board/board.constants';
import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class AttackerModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.ATTACKER.id, game, source, {
      name: KEYWORDS.ATTACKER.name,
      description: KEYWORDS.ATTACKER.description,
      icon: `keyword-${KEYWORDS.ATTACKER.id}`,
      mixins: [
        new TogglableModifierMixin(game, () => {
          return (
            this.target.location === CARD_LOCATIONS.BOARD &&
            this.target.zone === BOARD_SLOT_ZONES.ATTACK_ZONE
          );
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
