import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { WhileOnBoardModifier } from './while-on-board.modifier';
import type { ModifierMixin } from '../modifier-mixin';
import type { MinionBlueprint } from '../../card/card-blueprint';

export class SpawnModifier<T extends MinionCard> extends WhileOnBoardModifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      blueprint: () => MinionBlueprint;
      mixins?: Array<ModifierMixin<T>>;
    }
  ) {
    super(KEYWORDS.SPAWN.id, game, source, {
      name: KEYWORDS.SPAWN.name,
      description: KEYWORDS.SPAWN.description,
      icon: 'icons/keyword-spawn',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SPAWN),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.AFTER_CHANGE_PHASE,
          filter: () => {
            return !this.target.player.boardSide.base.some(space => space.isEmpty);
          },
          handler: async () => {
            const blueprint = options.blueprint();
            const card = await this.target.player.generateCard<MinionCard>(
              blueprint.id,
              this.target.isFoil
            );
            const space = this.target.player.boardSide.base.find(space => space.isEmpty);
            if (space) {
              await card.playImmediatelyAt(space, { shouldExhaust: false });
            }
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
