import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { Game } from '../../game/game';
import { Modifier } from '../modifier.entity';

export class SpellSlingerCounterModifier extends Modifier<HeroCard> {
  constructor(game: Game, source: AnyCard) {
    super('spellslinger-counter', game, source, {
      isUnique: true,
      name: 'Spellslinger',
      description: 'Gain a stack when you play a spell.',
      icon: 'icons/erina-passive',
      mixins: []
    });
  }
}
