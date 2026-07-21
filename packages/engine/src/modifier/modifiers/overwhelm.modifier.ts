import { KEYWORDS } from '../../card/card-keywords';
import { isMinion } from '../../card/card-utils';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Battlefield } from '../../board/battlefield';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';

export class OverwhelmModifier extends Modifier<MinionCard> {
  private excessDamageByTarget: Record<
    string,
    { excess: number; battlefield: Battlefield }
  > = {};

  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<MinionCard>[] } = {}
  ) {
    super(KEYWORDS.OVERWHELM.id, game, source, {
      name: KEYWORDS.OVERWHELM.name,
      description: KEYWORDS.OVERWHELM.description,
      icon: 'icons/keyword-overwhelm',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.OVERWHELM),
        new TogglableModifierMixin(game, () => this.target.isOnBattlefield),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_BEFORE_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;
            if (!this.target.isOnBattlefield) return;

            for (const affected of event.data.affectedCards) {
              if (!isMinion(affected)) continue;
              const battlefield = affected.battlefield;
              if (!battlefield) continue;
              const excess =
                event.data.damage.getFinalAmount(affected) - affected.remainingHp;
              if (excess <= 0) continue;
              this.excessDamageByTarget[affected.id] = {
                excess,
                battlefield: battlefield.opponentBattlefield
              };
            }
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE,
          handler: async event => {
            if (!event.data.card.equals(this.target)) return;

            for (const entry of Object.values(this.excessDamageByTarget)) {
              await entry.battlefield.gainScore(entry.excess);
            }

            this.excessDamageByTarget = {};
          }
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
