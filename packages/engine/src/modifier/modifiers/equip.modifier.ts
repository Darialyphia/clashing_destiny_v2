import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { RemoveOnLeaveBoardModifierMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import type { Game } from '../../game/game';
import { CardAuraModifierMixin } from '../mixins/aura.mixin';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';

export class EquippedModifier extends Modifier<ArtifactCard> {
  constructor(
    game: Game,
    source: ArtifactCard,
    options: {
      attachedTo: MinionCard;
      mixins?: ModifierMixin<ArtifactCard>[];
      modifiersToAdd: Modifier<MinionCard>[];
    }
  ) {
    super(`${source.id}-equip`, game, source, {
      name: 'Equipped',
      description: () => `Equipped to ${options.attachedTo.blueprint.name}`,
      icon: 'keyword/equipped',
      mixins: [
        new RemoveOnLeaveBoardModifierMixin(game),
        new RemoveOnLeaveBoardModifierMixin(game, options.attachedTo),
        new CardAuraModifierMixin(game, source, {
          isElligible(candidate) {
            return candidate.equals(options.attachedTo) && candidate.isOnBoard;
          },
          getModifiers() {
            return options.modifiersToAdd;
          }
        }),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
          filter: event => event.data.card.equals(options.attachedTo),
          handler: async () => {
            await source.loseDurability(1);
          }
        })
      ]
    });
  }
}
