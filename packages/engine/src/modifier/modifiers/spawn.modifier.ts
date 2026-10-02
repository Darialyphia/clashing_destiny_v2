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
import { GAME_PHASES } from '../../game/game.enums';
import { CardEffectTriggeredEvent } from '../../card/card.events';

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
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SPAWN),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.AFTER_CHANGE_PHASE,
          filter: event => {
            return (
              event.data.from === GAME_PHASES.SUPPLY &&
              event.data.to.state === GAME_PHASES.MAIN &&
              this.target.player.boardSide.base.some(space => space.isEmpty)
            );
          },
          handler: async () => {
            await this.game.emit(
              GAME_EVENTS.CARD_EFFECT_TRIGGERED,
              new CardEffectTriggeredEvent({
                card: this.target,
                message: `${this.target.blueprint.name} spawns a ${options.blueprint().name}.`
              })
            );
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
