import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { AbilityDamage } from '../../utils/damage';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import { Unit } from '../../unit/unit.entity';
import { Player } from '../../player/player.entity';

export class OverwhelmCardModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<T>[];
      unitMixins?: ModifierMixin<Unit>[];
    }
  ) {
    super(KEYWORDS.OVERWHELM.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.OVERWHELM),
        new UnitEffectModifierMixin(game, {
          getModifier: () =>
            new OverwhelmUnitModifier(game, this.initialSource, {
              mixins: options?.unitMixins ?? []
            })
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class OverwhelmUnitModifier extends Modifier<Unit> {
  private excessDamageByTarget: Record<string, number> = {};

  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<Unit>[] } = {}
  ) {
    super(KEYWORDS.OVERWHELM.id, game, source, {
      name: KEYWORDS.OVERWHELM.name,
      description: KEYWORDS.OVERWHELM.description,
      icon: 'keyword-overwhelm',
      isUnique: true,
      mixins: mixins ?? []
    });
  }

  async applyTo(target: Unit): Promise<void> {
    await super.applyTo(target);

    this.addMixin(
      new GameEventModifierMixin(this.game, {
        eventName: GAME_EVENTS.COMBAT_BEFORE_DEAL_DAMAGE,
        handler: async event => {
          if (!event?.data.attacker.equals(this.target)) return;

          for (const target of event.data.targets) {
            if (target instanceof Player) continue;
            const amount = event.data.damage.getFinalAmount(target);
            if (amount <= target.remainingHp) continue;
            this.excessDamageByTarget[target.id] = amount - target.remainingHp;
          }
        }
      })
    );

    this.addMixin(
      new GameEventModifierMixin(this.game, {
        eventName: GAME_EVENTS.COMBAT_AFTER_DEAL_DAMAGE,
        handler: async event => {
          if (!event?.data.attacker.equals(this.target)) return;

          const totalAmount = Object.values(this.excessDamageByTarget).reduce(
            (sum, val) => sum + val,
            0
          );

          await target.player.takeDamage(
            this.target.card,
            new AbilityDamage(this.target.card, totalAmount)
          );
        }
      })
    );
  }
}
