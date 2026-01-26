import { KEYWORDS } from '../../card/card-keywords';
import { CARD_DECK_SOURCES } from '../../card/card.enums';
import type { AbilityOwner } from '../../card/entities/ability.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class IntimidateModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { level: number; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.INTIMIDATE.id, game, source, {
      name: 'Intimidate',
      description: `This card has Intimidate ${options.level}.`,
      icon: 'keyword-intimidate',
      isUnique: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.INTIMIDATE),
        new RemoveOnDestroyedMixin(game),
        // @ts-expect-error
        new MinionInterceptorModifierMixin(game, {
          key: 'canBeAttacked',
          interceptor: (value, { attacker }) => {
            if (!value) return value;
            if (attacker.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) return value;

            return attacker.manaCost > options.level;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
