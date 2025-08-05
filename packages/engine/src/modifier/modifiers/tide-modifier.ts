import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { DestinyCard } from '../../card/entities/destiny.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { tidesFavored } from '../../card/sets/core/destinies/tides-favored';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class TidesFavoredModifier extends Modifier<DestinyCard> {
  constructor(game: Game, source: AnyCard) {
    super('tides-favored', game, source, {
      isUnique: true,
      name: "Tide's Favored",
      description: KEYWORDS.TIDE.description,
      mixins: [
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_END_TURN,
          handler: async (event, modifier) => {
            if (event.data.player.equals(source.player)) {
              await modifier.setStacks((modifier.stacks + 1) % 3);
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

          const tidesFavored = source.player.unlockedDestinyCards
            .find(card => card.modifiers.get(TidesFavoredModifier))
            ?.modifiers.get(TidesFavoredModifier);

          const stacks = tidesFavored?.stacks ?? 0;
          console.log('TideModifier stacks:', stacks, 'allowedLevels:', allowedLevels);
          return allowedLevels.includes(stacks as 1 | 2 | 3);
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
