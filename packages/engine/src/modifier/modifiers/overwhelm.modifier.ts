import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { PiercingAOE } from '../../card/attack-aoe';
import { GAME_EVENTS } from '../../game/game.events';
import { isHero, isMinion } from '../../card/card-utils';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { AbilityDamage } from '../../utils/damage';

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
      mixins: [new KeywordModifierMixin(game, KEYWORDS.OVERWHELM), ...(mixins ?? [])]
    });
  }

  async applyTo(target: T): Promise<void> {
    await super.applyTo(target);

    this.addMixin(
      new GameEventModifierMixin(this.game, {
        eventName: isMinion(this.target)
          ? GAME_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE
          : GAME_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE,
        handler: async event => {
          if (this.target.location !== 'board') return;
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
        eventName: isMinion(this.target)
          ? GAME_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE
          : GAME_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
        handler: async event => {
          if (this.target.location !== 'board') return;
          if (!event.data.card.equals(this.target)) return;

          for (const target of event.data.affectedCards) {
            if (isHero(target)) continue;
            const excessDamage = this.excessDamageByTarget[target.id];
            if (!excessDamage) continue;
            delete this.excessDamageByTarget[target.id];

            await target.player.hero.takeDamage(
              this.target,
              new AbilityDamage(excessDamage)
            );
          }
        }
      })
    );
  }
}
