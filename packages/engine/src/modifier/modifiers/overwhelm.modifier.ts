import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { isHero } from '../../card/card-utils';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { AbilityDamage } from '../../utils/damage';
import { CARD_LOCATIONS } from '../../card/card.enums';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';

export class OverwhelmModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  private excessDamageByTarget: Record<string, number> = {};

  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.OVERWHELM.id, game, source, {
      name: KEYWORDS.OVERWHELM.name,
      description: KEYWORDS.OVERWHELM.description,
      icon: 'keyword-overwhelm',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.OVERWHELM),
        new TogglableModifierMixin(
          game,
          () => this.target.location === CARD_LOCATIONS.BOARD
        ),
        ...(mixins ?? [])
      ]
    });
  }

  async applyTo(target: T): Promise<void> {
    await super.applyTo(target);

    this.addMixin(
      new GameEventModifierMixin(this.game, {
        eventName: GAME_EVENTS.CARD_BEFORE_DEAL_COMBAT_DAMAGE,
        handler: async event => {
          if (!event.data.card.equals(this.target)) return;

          for (const target of event.data.affectedCards) {
            if (isHero(target)) continue;
            const amount = event.data.damage.getFinalAmount(target);
            if (amount <= target.remainingHp) continue;
            this.excessDamageByTarget[target.id] = amount - target.remainingHp;
          }
        }
      })
    );

    this.addMixin(
      new GameEventModifierMixin(this.game, {
        eventName: GAME_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE,
        handler: async event => {
          if (this.target.location !== 'board') return;
          if (!event.data.card.equals(this.target)) return;

          const totalAmount = Object.values(this.excessDamageByTarget).reduce(
            (sum, val) => sum + val,
            0
          );

          await target.player.hero.takeDamage(
            this.target,
            new AbilityDamage(totalAmount)
          );
        }
      })
    );
  }
}
