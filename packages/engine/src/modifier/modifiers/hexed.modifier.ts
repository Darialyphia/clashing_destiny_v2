import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GrantAbilityModifierMixin } from '../mixins/grant-ability.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class HexedModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { stacks: number; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.HEXED.id, game, source, {
      name: KEYWORDS.HEXED.name,
      description: KEYWORDS.HEXED.description,
      icon: 'keyword-hexed',
      isUnique: true,
      stacks: options.stacks,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.HEXED),
        new GrantAbilityModifierMixin(game, {
          id: 'remove-hexed',
          label: 'Remove Hexed',
          description: 'Remove Hexed from this card.',
          manaCost: 2,
          shouldExhaust: false,
          canUse: () => true,
          getTargets: () => Promise.resolve([]),
          isHiddenOnCard: true,
          onResolve: () => {
            return this.target.modifiers.remove(KEYWORDS.HEXED.id);
          },
          aiHints: {
            shouldUse: () => 0.5
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
