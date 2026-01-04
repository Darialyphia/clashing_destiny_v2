import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { isMinion } from '../../card/card-utils';
import { BOARD_SLOT_ZONES } from '../../board/board.constants';

export class PullerModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.PULLER.id, game, source, {
      name: KEYWORDS.PULLER.name,
      description: KEYWORDS.PULLER.description,
      icon: 'keyword-puller',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PULLER),
        new TogglableModifierMixin(
          game,
          () => this.target.location === CARD_LOCATIONS.BOARD
        ),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;

            for (const affectedCard of event.data.affectedCards) {
              if (!isMinion(affectedCard)) continue;

              if (
                affectedCard.location === CARD_LOCATIONS.BOARD &&
                affectedCard.zone === BOARD_SLOT_ZONES.DEFENSE_ZONE
              ) {
                await affectedCard.move();
              }
            }
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
