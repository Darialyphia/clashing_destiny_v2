import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Attacker } from '../../game/phases/combat.phase';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class BurstAttackModifier<T extends Attacker> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    { mixins }: { mixins?: ModifierMixin<T>[] } = {}
  ) {
    super(KEYWORDS.BURST_ATTACK.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BURST_ATTACK),
        new MinionInterceptorModifierMixin(game, {
          key: 'shouldCreateChainOnAttack',
          interceptor: () => false
        }) as ModifierMixin<T>,
        ...(mixins ?? [])
      ]
    });
  }
}
