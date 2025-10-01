import { KEYWORDS } from '../../card/card-keywords';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { SpellCard } from '../../card/entities/spell.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { FleetingModifier } from './fleeting.modifier';

export class EchoedDestinyModifier<
  T extends MinionCard | ArtifactCard | SpellCard
> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: {
      mixins?: ModifierMixin<T>[];
    }
  ) {
    super(KEYWORDS.ECHOED_DESTINY.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ECHOED_DESTINY),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_PAY_FOR_DESTINY_COST,
          handler: async event => {
            if (!event.data.player.equals(this.target.player)) return;
            if (event.data.cards.some(card => card.card.equals(this.target))) {
              await this.target.addToHand();
              // @ts-expect-error
              await this.target.modifiers.add(new FleetingModifier<T>(game, source));
            }
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
