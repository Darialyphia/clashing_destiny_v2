import { KEYWORDS } from '../../card/card-keywords';
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

export class TidesFavoredModifier extends Modifier<HeroCard> {
  constructor(game: Game, source: AnyCard) {
    super('tides-favored', game, source, {
      isUnique: true,
      name: "Tide's Favored",
      description: KEYWORDS.TIDE.description,
      icon: 'keyword-tides-favored',
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_START_TURN,
          handler: async (event, modifier) => {
            if (game.gamePhaseSystem.elapsedTurns === 0) return;
            if (event.data.player.equals(source.player)) {
              const newStacks = modifier.stacks + 1 > 3 ? 1 : modifier.stacks + 1;
              await modifier.setStacks(newStacks);
            }
          }
        })
      ]
    });
  }
}

export class TideModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    {
      allowedLevels,
      mixins
    }: {
      allowedLevels: Array<1 | 2 | 3>;
      mixins?: ModifierMixin<MinionCard>[];
    }
  ) {
    super(KEYWORDS.TIDE.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.TIDE),
        new TogglableModifierMixin(game, () => {
          if (source.location !== 'board') return false;

          const stacks =
            source.player.hero.modifiers.get(TidesFavoredModifier)?.stacks ?? 0;

          return allowedLevels.includes(stacks as 1 | 2 | 3);
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
